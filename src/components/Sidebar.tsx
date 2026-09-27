import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  Settings,
  User,
  Sparkles,
  Menu,
  Home,
  ImageIcon,
  FileText,
  Globe,
  Phone,
  HardHat,
} from 'lucide-react';
import { Conversation, UserAccount } from '../types';
import { PWAInstallPrompt } from './PWAInstallPrompt';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onDeleteChat: (id: string) => void;
  onOpenSettings: () => void;
  user: UserAccount;
  onOpenAuth: () => void;
  isOnline: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigateHome?: () => void;
  onOpenCVModal: () => void;
  onOpenUrlModal: () => void;
  onOpenImageModal: () => void;
  onOpenLiveCall: () => void;
  onOpenSiteReport: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  currentChatId,
  onSelectChat,
  onNewChat,
  onRenameChat,
  onDeleteChat,
  onOpenSettings,
  user,
  onOpenAuth,
  isOnline,
  isCollapsed = false,
  onToggleCollapse,
  onNavigateHome,
  onOpenCVModal,
  onOpenUrlModal,
  onOpenImageModal,
  onOpenLiveCall,
  onOpenSiteReport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filtered = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  });

  const startRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameChat(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-[#1e1f20] border-r border-[#282a2c] text-[#e3e3e3] transition-all duration-250 ease-in-out md:static ${
          isOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-[68px]' : 'md:w-72'}`}
      >
        {/* Top Header: Hamburger Toggle + NOVA AI Branding */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#282a2c]/60">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onToggleCollapse || onClose}
              id="sidebar-collapse-toggle"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#c4c7c5] hover:bg-[#282a2c] hover:text-white transition"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu className="h-5 w-5" />
            </button>

            {!isCollapsed && (
              <div className="flex items-center gap-2 truncate animate-in fade-in duration-200">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#4285f4] via-[#9b72cb] to-[#d96570] text-white shadow-xs">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="truncate">
                  <span className="text-sm font-bold tracking-tight text-[#e3e3e3] font-['Plus_Jakarta_Sans',sans-serif]">
                    NOVA AI
                  </span>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#8e918f] hover:bg-[#282a2c] hover:text-white md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Buttons: Home & New Chat */}
        <div className="p-3 flex flex-col gap-2">
          {onNavigateHome && (
            <button
              onClick={() => {
                onNavigateHome();
                if (window.innerWidth < 768) onClose();
              }}
              id="sidebar-home-btn"
              className={`group flex items-center justify-start gap-2.5 rounded-full border border-[#333538] bg-[#1a1a1c] hover:bg-[#282a2c] hover:border-[#444746] py-2 px-3.5 text-xs font-semibold text-[#e3e3e3] shadow-xs transition-all w-full cursor-pointer ${
                isCollapsed ? 'md:px-2 md:justify-center' : ''
              }`}
              title="Home Page"
            >
              <Home className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
              {!isCollapsed && <span className="tracking-wide">Home Page</span>}
            </button>
          )}

          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            id="sidebar-new-chat-btn"
            className={`group flex items-center justify-start gap-2.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 py-2 px-3.5 text-xs font-semibold text-indigo-200 shadow-xs transition-all w-full cursor-pointer ${
              isCollapsed ? 'md:px-2 md:justify-center' : ''
            }`}
            title="New Chat"
          >
            <Plus className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
            {!isCollapsed && <span className="tracking-wide">New chat</span>}
          </button>
        </div>

        {/* Features List */}
        {!isCollapsed && (
            <div className="p-3 border-t border-[#282a2c] space-y-1">
                <div className="px-3 py-2 text-[11px] font-semibold text-[#8e918f] tracking-wider uppercase">Features</div>
                <button onClick={onOpenImageModal} className="flex w-full items-center gap-3 rounded-full px-3 py-2 text-xs text-[#c4c7c5] hover:bg-[#282a2c]">
                    <ImageIcon className="h-4 w-4" /> AI Image Generator
                </button>
                <button onClick={onOpenLiveCall} className="flex w-full items-center gap-3 rounded-full px-3 py-2 text-xs text-[#c4c7c5] hover:bg-[#282a2c]">
                    <Phone className="h-4 w-4" /> Live Voice Call
                </button>
                <button onClick={onOpenSiteReport} className="flex w-full items-center gap-3 rounded-full px-3 py-2 text-xs text-[#c4c7c5] hover:bg-[#282a2c]">
                    <HardHat className="h-4 w-4" /> Site Report
                </button>
                <button onClick={onOpenCVModal} className="flex w-full items-center gap-3 rounded-full px-3 py-2 text-xs text-[#c4c7c5] hover:bg-[#282a2c]">
                    <FileText className="h-4 w-4" /> CV Builder
                </button>
                <button onClick={onOpenUrlModal} className="flex w-full items-center gap-3 rounded-full px-3 py-2 text-xs text-[#c4c7c5] hover:bg-[#282a2c]">
                    <Globe className="h-4 w-4" /> URL Analysis
                </button>
            </div>
        )}

        {/* Search Bar */}
        {!isCollapsed && (
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8e918f]" />
              <input
                type="text"
                id="sidebar-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full rounded-full border border-[#2e3134] bg-[#131314] pl-9 pr-8 py-1.5 text-xs text-[#e3e3e3] placeholder:text-[#8e918f] focus:outline-none focus:border-[#444746] focus:ring-1 focus:ring-[#444746]"
              />
            </div>
          </div>
        )}

        {/* Recent Conversations */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          {!isCollapsed && <div className="px-3 py-2 text-[11px] font-semibold text-[#8e918f] tracking-wider uppercase">Recent</div>}
          {filtered.map((conv) => (
             <div key={conv.id} onClick={() => { onSelectChat(conv.id); if(window.innerWidth < 768) onClose(); }} className="cursor-pointer px-4 py-2 text-xs text-[#c4c7c5] hover:bg-[#282a2c] rounded-full truncate">{conv.title}</div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-[#282a2c] p-2 space-y-1">
          <button onClick={onOpenSettings} className="flex w-full items-center gap-3 rounded-full px-3 py-2 text-xs text-[#c4c7c5] hover:bg-[#282a2c]">
            <Settings className="h-4 w-4" /> Settings
          </button>
          <button onClick={onOpenAuth} className="flex w-full items-center gap-3 rounded-full px-3 py-2 text-xs text-[#c4c7c5] hover:bg-[#282a2c]">
            <User className="h-4 w-4" /> {user.name}
          </button>
        </div>
      </aside>
    </>
  );
};
