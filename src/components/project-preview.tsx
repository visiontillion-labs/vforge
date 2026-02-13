'use client';

import { useMemo, useState } from 'react';
import {
  Braces,
  ChevronRight,
  FileCode2,
  FileText,
  FileType,
  Image as ImageIcon,
  FolderOpen,
  FolderClosed,
  FileJson,
  Settings,
  Palette,
} from 'lucide-react';

import {
  buildTreeData,
  countFiles,
  type TreeData,
} from '@/lib/generate-tree-data';
import { cn } from '@/lib/utils';

// File icon based on extension
function getFileIcon(extension: string | undefined, className: string) {
  switch (extension) {
    case 'tsx':
    case 'jsx':
      return <FileCode2 className={className} />;
    case 'ts':
    case 'js':
    case 'mjs':
      return <FileType className={className} />;
    case 'json':
      return <Braces className={className} />;
    case 'css':
      return <Palette className={className} />;
    case 'svg':
    case 'ico':
    case 'png':
    case 'jpg':
      return <ImageIcon className={className} />;
    case 'md':
      return <FileText className={className} />;
    case 'prisma':
    case 'yml':
    case 'yaml':
      return <Settings className={className} />;
    default:
      return <FileJson className={className} />;
  }
}

// Recursive tree node
function TreeNode({
  itemId,
  treeData,
  depth,
}: {
  itemId: string;
  treeData: TreeData;
  depth: number;
}) {
  const item = treeData[itemId];
  const isFolder = !!item?.children && item.children.length > 0;
  const [isOpen, setIsOpen] = useState(true);

  if (!item) return null;

  return (
    <div>
      <button
        type='button'
        onClick={() => isFolder && setIsOpen((o) => !o)}
        className={cn(
          'flex items-center gap-1.5 w-full text-left py-[3px] px-1.5 rounded-sm text-xs hover:bg-accent/50 transition-colors',
          isFolder && 'cursor-pointer',
          !isFolder && 'cursor-default',
        )}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
      >
        {isFolder ? (
          <>
            <ChevronRight
              className={cn(
                'size-3 text-muted-foreground shrink-0 transition-transform duration-150',
                isOpen && 'rotate-90',
              )}
            />
            {isOpen ? (
              <FolderOpen className='size-3.5 text-blue-400 shrink-0' />
            ) : (
              <FolderClosed className='size-3.5 text-blue-400 shrink-0' />
            )}
            <span className='font-medium truncate'>{item.name}</span>
          </>
        ) : (
          <>
            <span className='w-3 shrink-0' />
            {getFileIcon(
              item.fileExtension,
              'text-muted-foreground shrink-0 size-3.5',
            )}
            <span className='truncate text-muted-foreground'>{item.name}</span>
          </>
        )}
      </button>
      {isFolder && isOpen && (
        <div>
          {item.children!.map((childId) => (
            <TreeNode
              key={childId}
              itemId={childId}
              treeData={treeData}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ProjectPreviewProps {
  formValues: {
    projectName: string;
    router: 'app' | 'pages';
    language: 'ts' | 'js';
    linter: 'eslint' | 'biome' | 'none';
    srcDir: boolean;
    features: {
      tailwind: boolean;
      shadcn: boolean;
      reactCompiler: boolean;
      docker: boolean;
      git: boolean;
      storybook: boolean;
    };
    auth: string;
    database: string;
    api: string;
    state: string;
    payment: string;
    ai: string;
    monitoring: string;
    i18n: string;
    i18nRouting?: string;
    languages?: string;
    seo: boolean;
    testing: boolean;
  };
}

export function ProjectPreview({ formValues }: ProjectPreviewProps) {
  const treeData = useMemo(() => buildTreeData(formValues), [formValues]);
  const fileCount = useMemo(() => countFiles(treeData), [treeData]);
  const rootItem = treeData['root'];

  return (
    <div className='flex flex-col h-full'>
      <div className='flex items-center gap-2 pb-3 mb-3 border-b'>
        <FileCode2 className='h-4 w-4 text-muted-foreground' />
        <span className='text-sm font-medium'>Project Structure</span>
        <span className='ml-auto text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full'>
          {fileCount} files
        </span>
      </div>

      <div className='flex-1 overflow-auto -mx-1 px-1'>
        {rootItem?.children?.map((childId) => (
          <TreeNode
            key={childId}
            itemId={childId}
            treeData={treeData}
            depth={0}
          />
        ))}
      </div>
    </div>
  );
}
