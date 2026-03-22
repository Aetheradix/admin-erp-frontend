import type { Node } from '../hooks/mockStats';

interface OrgChartProps {
  nodes: Node[];
}

export function OrgChart({ nodes }: OrgChartProps) {
  // Simple hierarchical rendering for demonstration
  const root = nodes.find(n => !n.parentId);
  const getChildren = (id: string) => nodes.filter(n => n.parentId === id);

  const renderNode = (node: Node, level = 0) => {
    const children = getChildren(node.id);
    return (
      <div key={node.id} className="flex flex-col gap-6">
        <div 
          className="relative bg-white p-6 rounded-[32px] border border-border-subtle shadow-soft hover:shadow-lg transition-all duration-500 w-64 group"
          style={{ marginLeft: `${level * 40}px` }}
        >
          {level > 0 && (
            <div className="absolute -left-10 top-1/2 w-10 h-px bg-border-strong" />
          )}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-surface-subtle shadow-inner">
              <img src={node.image} alt={node.name} width={48} height={48} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col min-w-0">
              <h4 className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">{node.name}</h4>
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider truncate">{node.role}</span>
            </div>
          </div>
        </div>
        {children.length > 0 && (
          <div className="flex flex-col gap-6 border-l border-border-strong ml-[32px] pl-[48px] -mt-2">
            {children.map(child => renderNode(child, 0))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-surface-subtle/30 p-12 rounded-[48px] border border-border-subtle overflow-x-auto no-scrollbar">
      <div className="min-w-max flex flex-col gap-10">
        <div className="flex flex-col gap-2 mb-8">
          <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Organization Hierarchy</h3>
          <p className="text-sm font-medium text-muted-foreground italic">Visualizing team leadership and reporting lines</p>
        </div>
        {root && renderNode(root)}
      </div>
    </div>
  );
}
