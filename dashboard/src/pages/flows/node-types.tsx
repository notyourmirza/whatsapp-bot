import { Handle, Position, type NodeProps } from '@xyflow/react';
import { MessageSquare, Image, Bot, GitBranch, Clock, Variable, Tag, Globe, Pause, FileText, Play, StopCircle } from 'lucide-react';

const nodeColors: Record<string, { bg: string; border: string; icon: string }> = {
  trigger: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', icon: 'text-emerald-400' },
  send_message: { bg: 'bg-blue-500/10', border: 'border-blue-500/40', icon: 'text-blue-400' },
  send_buttons: { bg: 'bg-sky-500/10', border: 'border-sky-500/40', icon: 'text-sky-400' },
  send_media: { bg: 'bg-purple-500/10', border: 'border-purple-500/40', icon: 'text-purple-400' },
  send_template: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/40', icon: 'text-cyan-400' },
  ai_reply: { bg: 'bg-amber-500/10', border: 'border-amber-500/40', icon: 'text-amber-400' },
  condition: { bg: 'bg-orange-500/10', border: 'border-orange-500/40', icon: 'text-orange-400' },
  delay: { bg: 'bg-pink-500/10', border: 'border-pink-500/40', icon: 'text-pink-400' },
  set_variable: { bg: 'bg-teal-500/10', border: 'border-teal-500/40', icon: 'text-teal-400' },
  add_tag: { bg: 'bg-lime-500/10', border: 'border-lime-500/40', icon: 'text-lime-400' },
  human_handoff: { bg: 'bg-red-500/10', border: 'border-red-500/40', icon: 'text-red-400' },
  business_hours: { bg: 'bg-violet-500/10', border: 'border-violet-500/40', icon: 'text-violet-400' },
  follow_up: { bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/40', icon: 'text-fuchsia-400' },
  broadcast_optin: { bg: 'bg-green-500/10', border: 'border-green-500/40', icon: 'text-green-400' },
  order_status: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/40', icon: 'text-yellow-400' },
  http_request: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/40', icon: 'text-indigo-400' },
  wait_for_reply: { bg: 'bg-rose-500/10', border: 'border-rose-500/40', icon: 'text-rose-400' },
  end: { bg: 'bg-red-500/10', border: 'border-red-500/40', icon: 'text-red-400' },
};

const nodeIcons: Record<string, any> = {
  trigger: Play, send_message: MessageSquare, send_buttons: MessageSquare, send_media: Image,
  send_template: FileText, ai_reply: Bot, condition: GitBranch, delay: Clock,
  set_variable: Variable, add_tag: Tag, human_handoff: Pause, business_hours: Clock,
  follow_up: Clock, broadcast_optin: Tag, order_status: FileText,
  http_request: Globe, wait_for_reply: Pause, end: StopCircle,
};

function FlowNode({ data, type, selected }: NodeProps & { type: string }) {
  const colors = nodeColors[type] || nodeColors.trigger;
  const Icon = nodeIcons[type] || Play;
  const isCondition = type === 'condition';
  const isTrigger = type === 'trigger';
  const isEnd = type === 'end';
  return (
    <div className={`rounded-xl border-2 ${colors.bg} ${colors.border} min-w-[200px] max-w-[260px] shadow-lg backdrop-blur-sm transition-all ${selected ? 'ring-2 ring-emerald-400/60 scale-105' : 'hover:scale-[1.02]'}`}>
      {!isTrigger && <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[#8b949e] !border-2 !border-[#161b22]" />}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-white/5">
        <div className={`p-1.5 rounded-lg ${colors.bg}`}><Icon className={`h-4 w-4 ${colors.icon}`} /></div>
        <div className="flex-1 min-w-0"><p className="text-xs font-bold text-[var(--text)] truncate">{data.label || type}</p>{data.subtitle && <p className="text-[10px] text-[var(--text-muted)] truncate">{data.subtitle}</p>}</div>
      </div>
      {data.message && <div className="px-3.5 py-2 text-[11px] text-[var(--text-sec)] leading-relaxed line-clamp-2">{data.message}</div>}
      {data.description && !data.message && <div className="px-3.5 py-2 text-[11px] text-[var(--text-sec)]">{data.description}</div>}
      {isCondition ? <><Handle type="source" position={Position.Bottom} id="true" className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-[#161b22] !left-[30%]" /><Handle type="source" position={Position.Bottom} id="false" className="!w-3 !h-3 !bg-red-400 !border-2 !border-[#161b22] !left-[70%]" /><div className="flex justify-between px-4 pb-1.5 text-[9px] font-semibold"><span className="text-emerald-400">YES</span><span className="text-red-400">NO</span></div></> : !isEnd ? <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-[#8b949e] !border-2 !border-[#161b22]" /> : null}
    </div>
  );
}

export const customNodeTypes: Record<string, React.ComponentType<any>> = {
  trigger: props => <FlowNode {...props} type="trigger" />, send_message: props => <FlowNode {...props} type="send_message" />, send_buttons: props => <FlowNode {...props} type="send_buttons" />, send_media: props => <FlowNode {...props} type="send_media" />, send_template: props => <FlowNode {...props} type="send_template" />, ai_reply: props => <FlowNode {...props} type="ai_reply" />, condition: props => <FlowNode {...props} type="condition" />, delay: props => <FlowNode {...props} type="delay" />, set_variable: props => <FlowNode {...props} type="set_variable" />, add_tag: props => <FlowNode {...props} type="add_tag" />, human_handoff: props => <FlowNode {...props} type="human_handoff" />, business_hours: props => <FlowNode {...props} type="business_hours" />, follow_up: props => <FlowNode {...props} type="follow_up" />, broadcast_optin: props => <FlowNode {...props} type="broadcast_optin" />, order_status: props => <FlowNode {...props} type="order_status" />, http_request: props => <FlowNode {...props} type="http_request" />, wait_for_reply: props => <FlowNode {...props} type="wait_for_reply" />, end: props => <FlowNode {...props} type="end" />,
};

export const NODE_PALETTE = [
  { type: 'trigger', label: 'Trigger', description: 'Start when message arrives', category: 'Triggers' },
  { type: 'send_message', label: 'Send Message', description: 'Send a text message', category: 'Actions' },
  { type: 'send_buttons', label: 'Menu / Buttons', description: 'Send a numbered menu', category: 'Actions' },
  { type: 'send_media', label: 'Send Media', description: 'Send image, video, or file', category: 'Actions' },
  { type: 'send_template', label: 'Send Template', description: 'Use a saved template', category: 'Actions' },
  { type: 'ai_reply', label: 'AI Reply', description: 'Generate a language-aware response', category: 'Actions' },
  { type: 'human_handoff', label: 'Human Handoff', description: 'Pause bot and notify admin', category: 'Actions' },
  { type: 'follow_up', label: 'Follow-up', description: 'Set follow-up reminder metadata', category: 'Actions' },
  { type: 'order_status', label: 'Order Status', description: 'Lookup configurable order status', category: 'Actions' },
  { type: 'condition', label: 'Condition', description: 'Branch based on logic', category: 'Logic' },
  { type: 'business_hours', label: 'Business Hours', description: 'Set open/closed context', category: 'Logic' },
  { type: 'delay', label: 'Delay', description: 'Wait before continuing', category: 'Logic' },
  { type: 'wait_for_reply', label: 'Wait for Reply', description: 'Pause until user responds', category: 'Logic' },
  { type: 'set_variable', label: 'Set Variable', description: 'Store a value', category: 'Data' },
  { type: 'add_tag', label: 'Add Tag', description: 'Tag the contact', category: 'Data' },
  { type: 'broadcast_optin', label: 'Broadcast Opt-in', description: 'Record customer consent', category: 'Data' },
  { type: 'http_request', label: 'HTTP Request', description: 'Call external API', category: 'Data' },
  { type: 'end', label: 'End', description: 'Stop the flow', category: 'Logic' },
];
