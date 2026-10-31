const { prisma, getIsDbConnected } = require('../config/db');
const inMemoryStore = require('./inMemoryStore');
const { ROLES } = require('../constants/roles');
const logger = require('../utils/logger');

class UserService {
  async findByEmail(email) {
    const normalizedEmail = email.toLowerCase().trim();
    if (getIsDbConnected() && prisma) {
      try {
        return await prisma.user.findUnique({
          where: { email: normalizedEmail }
        });
      } catch (err) {
        logger.warn('Prisma query failed, checking in-memory store:', err.message);
      }
    }

    // Fallback in-memory
    for (const user of inMemoryStore.users.values()) {
      if (user.email.toLowerCase() === normalizedEmail) {
        return user;
      }
    }
    return null;
  }

  async findById(id) {
    if (getIsDbConnected() && prisma) {
      try {
        return await prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            companyName: true,
            phone: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }
        });
      } catch (err) {
        logger.warn('Prisma query failed, checking in-memory store:', err.message);
      }
    }

    const user = inMemoryStore.users.get(id);
    if (!user) return null;
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async createCustomer(userData) {
    const normalizedEmail = userData.email.toLowerCase().trim();

    // Check uniqueness constraint
    const existing = await this.findByEmail(normalizedEmail);
    if (existing) {
      const error = new Error('An account with this email address already exists');
      error.statusCode = 409;
      error.isOperational = true;
      throw error;
    }

    if (getIsDbConnected() && prisma) {
      try {
        return await prisma.user.create({
          data: {
            email: normalizedEmail,
            passwordHash: userData.passwordHash,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: ROLES.CUSTOMER,
            companyName: userData.companyName || null,
            phone: userData.phone || null,
            isActive: true
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            companyName: true,
            phone: true,
            createdAt: true
          }
        });
      } catch (err) {
        logger.warn('Prisma create failed, saving to in-memory store:', err.message);
      }
    }

    // In-memory store
    const newUser = {
      id: inMemoryStore.generateId(),
      email: normalizedEmail,
      passwordHash: userData.passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: ROLES.CUSTOMER,
      companyName: userData.companyName || null,
      phone: userData.phone || null,
      isActive: true,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryStore.users.set(newUser.id, newUser);

    const { passwordHash, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async createStaff(staffData) {
    const normalizedEmail = staffData.email.toLowerCase().trim();

    // Check uniqueness constraint
    const existing = await this.findByEmail(normalizedEmail);
    if (existing) {
      const error = new Error('An account with this email address already exists');
      error.statusCode = 409;
      error.isOperational = true;
      throw error;
    }

    if (getIsDbConnected() && prisma) {
      try {
        return await prisma.user.create({
          data: {
            email: normalizedEmail,
            passwordHash: staffData.passwordHash,
            firstName: staffData.firstName,
            lastName: staffData.lastName,
            role: ROLES.STAFF,
            phone: staffData.phone || null,
            isActive: true
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phone: true,
            createdAt: true
          }
        });
      } catch (err) {
        logger.warn('Prisma create staff failed, saving to in-memory store:', err.message);
      }
    }

    // In-memory store
    const newStaff = {
      id: inMemoryStore.generateId(),
      email: normalizedEmail,
      passwordHash: staffData.passwordHash,
      firstName: staffData.firstName,
      lastName: staffData.lastName,
      role: ROLES.STAFF,
      companyName: 'Brightloop Staff',
      phone: staffData.phone || null,
      isActive: true,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryStore.users.set(newStaff.id, newStaff);

    const { passwordHash, ...staffWithoutPassword } = newStaff;
    return staffWithoutPassword;
  }

  async listUsers(filters = {}) {
    const { role, search, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    if (getIsDbConnected() && prisma) {
      try {
        const where = {};
        if (role) where.role = role;
        if (search) {
          where.OR = [
            { email: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { companyName: { contains: search, mode: 'insensitive' } }
          ];
        }

        const [users, total] = await Promise.all([
          prisma.user.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              companyName: true,
              phone: true,
              isActive: true,
              createdAt: true
            }
          }),
          prisma.user.count({ where })
        ]);

        return { users, total, page: Number(page), limit: Number(limit) };
      } catch (err) {
        logger.warn('Prisma listUsers failed, falling back to in-memory:', err.message);
      }
    }

    let users = Array.from(inMemoryStore.users.values()).map(u => {
      const { passwordHash, ...rest } = u;
      return rest;
    });

    if (role) {
      users = users.filter(u => u.role === role);
    }
    if (search) {
      const s = search.toLowerCase();
      users = users.filter(u =>
        u.email.toLowerCase().includes(s) ||
        u.firstName.toLowerCase().includes(s) ||
        u.lastName.toLowerCase().includes(s) ||
        (u.companyName && u.companyName.toLowerCase().includes(s))
      );
    }

    const total = users.length;
    const paginated = users.slice(skip, skip + Number(limit));

    return { users: paginated, total, page: Number(page), limit: Number(limit) };
  }

  async saveResetToken(email, token, expires) {
    const user = await this.findByEmail(email);
    if (!user) return null;

    if (getIsDbConnected() && prisma) {
      try {
        return await prisma.user.update({
          where: { email },
          data: {
            resetPasswordToken: token,
            resetPasswordExpires: expires
          }
        });
      } catch (err) {
        logger.warn('Prisma reset token failed, saving in-memory:', err.message);
      }
    }

    const memoryUser = inMemoryStore.users.get(user.id);
    if (memoryUser) {
      memoryUser.resetPasswordToken = token;
      memoryUser.resetPasswordExpires = expires;
    }
    return memoryUser;
  }

  async resetPasswordWithToken(token, newPasswordHash) {
    const now = new Date();

    if (getIsDbConnected() && prisma) {
      try {
        const user = await prisma.user.findFirst({
          where: {
            resetPasswordToken: token,
            resetPasswordExpires: { gt: now }
          }
        });

        if (!user) {
          const error = new Error('Invalid or expired password reset token');
          error.statusCode = 400;
          error.isOperational = true;
          throw error;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            passwordHash: newPasswordHash,
            resetPasswordToken: null,
            resetPasswordExpires: null
          }
        });
        return true;
      } catch (err) {
        if (err.isOperational) throw err;
        logger.warn('Prisma reset password failed, checking in-memory:', err.message);
      }
    }

    // In-memory
    for (const user of inMemoryStore.users.values()) {
      if (user.resetPasswordToken === token && user.resetPasswordExpires > now) {
        user.passwordHash = newPasswordHash;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        user.updatedAt = new Date();
        return true;
      }
    }

    const error = new Error('Invalid or expired password reset token');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }
}

module.exports = new UserService();
