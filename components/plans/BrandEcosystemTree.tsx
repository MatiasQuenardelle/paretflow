'use client'

import { BrandNode } from '@/stores/planStore'

const colorMap: Record<string, string> = {
  blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
  purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  green: 'from-green-500/20 to-green-600/20 border-green-500/30',
  orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
  rose: 'from-rose-500/20 to-rose-600/20 border-rose-500/30',
  red: 'from-red-500/20 to-red-600/20 border-red-500/30',
  sky: 'from-sky-500/20 to-sky-600/20 border-sky-500/30',
  pink: 'from-pink-500/20 to-pink-600/20 border-pink-500/30',
}

const dotColorMap: Record<string, string> = {
  blue: 'bg-blue-400',
  purple: 'bg-purple-400',
  green: 'bg-green-400',
  orange: 'bg-orange-400',
  rose: 'bg-rose-400',
  red: 'bg-red-400',
  sky: 'bg-sky-400',
  pink: 'bg-pink-400',
}

function TreeNode({ node, depth = 0 }: { node: BrandNode; depth?: number }) {
  const colors = colorMap[node.color || 'blue'] || colorMap.blue
  const dot = dotColorMap[node.color || 'blue'] || dotColorMap.blue

  return (
    <div className={depth > 0 ? 'ml-6' : ''}>
      <div className={`p-3 rounded-xl bg-gradient-to-r ${colors} border backdrop-blur-sm mb-2`}>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
          <span className="font-medium text-sm">{node.name}</span>
        </div>
        {node.description && (
          <p className="text-xs text-muted mt-1 ml-[18px]">{node.description}</p>
        )}
      </div>
      {node.children.length > 0 && (
        <div className="border-l-2 border-white/10 ml-3 pl-1 space-y-1">
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function BrandEcosystemTree({ tree }: { tree: BrandNode }) {
  return <TreeNode node={tree} />
}
