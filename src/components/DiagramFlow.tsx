import React, { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  NodeTypes,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface DiagramFlowProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  nodeTypes?: NodeTypes;
  title?: string;
  className?: string;
  fitView?: boolean;
}

export function DiagramFlow({ initialNodes, initialEdges, nodeTypes, title, className = '', fitView = true }: DiagramFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: Connection) => {
    const id = `e-${params.source}-${params.target}`;
    setEdges((eds) => [...eds, { ...params, id, animated: true, style: { stroke: '#94a3b8' } }]);
  }, [setEdges]);

  return (
    <div className={`my-6 ${className}`}>
      {title && <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{title}</p>}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden" style={{ height: 420 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView={fitView}
          attributionPosition="bottom-left"
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e2e8f0" />
          <Controls showInteractive={false} />
          <MiniMap nodeStrokeWidth={3} style={{ borderRadius: 8 }} />
        </ReactFlow>
      </div>
    </div>
  );
}
