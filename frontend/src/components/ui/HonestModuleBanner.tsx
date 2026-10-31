import React from 'react';
import { AlertCircle, Code, Database, ArrowRight } from 'lucide-react';

interface HonestModuleBannerProps {
  moduleName: string;
  assignedRoleOrMember: string;
  modelNames: string[];
  workflowStages?: string[];
  note?: string;
}

export const HonestModuleBanner: React.FC<HonestModuleBannerProps> = ({
  moduleName,
  assignedRoleOrMember,
  modelNames,
  workflowStages,
  note,
}) => {
  return (
    <div className="bg-[#FAF9F5] border border-[#E4DEC9] rounded-md p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-sm bg-[#EFEAD8] text-[#8C7A3E] shrink-0 mt-0.5">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#635527] font-mono">
              Backend Contract Notice — {moduleName}
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-[#EFEAD8] text-[#71612C] border border-[#DDD5BE]">
              Scope: {assignedRoleOrMember}
            </span>
          </div>

          <p className="text-xs text-[#5C5230] mt-1.5 leading-relaxed">
            Database models exist in <code className="font-mono bg-[#EFEAD8] px-1 py-0.5 rounded text-[11px]">prisma/schema.prisma</code>, but live Express API endpoints for this module are currently scheduled for integration. The interface below represents the full operational workflow and data contract ready for endpoint binding.
          </p>

          {workflowStages && workflowStages.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#E8E1CE]">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#7E7044] block mb-1.5">
                Target State Machine Workflow:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                {workflowStages.map((stage, idx) => (
                  <React.Fragment key={stage}>
                    <span className="px-2 py-0.5 bg-surface border border-[#E0D9C4] rounded-sm text-ink text-[11px]">
                      {stage}
                    </span>
                    {idx < workflowStages.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-[#A89C76]" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] text-[#7E7044] font-mono">
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3" />
              Models: {modelNames.join(', ')}
            </span>
            <span className="flex items-center gap-1">
              <Code className="w-3 h-3" />
              Status: UI Architecture Ready / Endpoint Pending
            </span>
          </div>

          {note && (
            <p className="text-[11px] text-[#8C7A3E] mt-2 italic">
              Note: {note}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
