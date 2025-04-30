import { Button } from '#/components/ui/button';
import { ScrollArea } from '#/components/ui/scroll-area';
import {
  RiShining2Line,
  RiAttachment2,
  RiCpuLine,
  RiArrowUpLine,
  RiMicLine,
} from '@remixicon/react';
import { ChatMessage } from '#/components/chat/chat-message';
import { useRef, useEffect, useState } from 'react';
import { cn } from '#/lib/utils';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip';

import TextareaAutosize from 'react-textarea-autosize';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar';
import { Separator } from '#/components/ui/separator';

const groupUsers = [
  {
    id: 'u1',
    name: 'Alex',
    src: 'https://res.cloudinary.com/dlzlfasou/image/upload/v1741345634/user-02_mlqqqt.png',
  }, // Replace with actual paths or data
  { id: 'u2', name: 'Sam', src: 'https://avatar.iran.liara.run/public/48' },
  { id: 'u3', name: 'User 3', src: 'https://avatar.iran.liara.run/public/10' }, // Example with fallback
];

export default function Chat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [currentModel, setCurrentModel] = useState('GPT-4 Omni');
  const models = ['GPT-4 Omni', 'Claude 3 Opus', 'Llama 3 70B', 'Gemini Pro'];
  const [chatMode, setChatMode] = useState<'solo' | 'group'>('solo');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    console.log(`Sending message with model ${currentModel}:`, input);
    setInput('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full shadow-md md:rounded-s-[inherit] bg-gradient-to-t from-white to-blue-50/30 dark:from-gray-900 dark:to-gray-800 min-[1024px]:rounded-e-3xl">
      {/* Header */}
      <div className=" py-5 backdrop-blur-md bg-white/10 dark:bg-black/10 sticky top-0 z-10 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-gradient-to-r before:from-blue-500/20 before:via-purple-500/20 before:to-blue-500/20">
        {/* Header content */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <ToggleGroup
              type="single"
              value={chatMode}
              onValueChange={(val) => {
                if (val) setChatMode(val as 'solo' | 'group');
              }}
              className=" flex rounded-lg border p-1"
            >
              <ToggleGroupItem
                value="solo"
                aria-label="Solo"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-muted/50 data-[state=on]:bg-gradient-to-r data-[state=on]:from-pink-500/10 data-[state=on]:to-purple-500/10 data-[state=on]:text-foreground data-[state=on]:shadow-sm data-[state=on]:ring-1 data-[state=on]:ring-pink-500/20"
              >
                <User className="h-4 w-4" />
                Solo
              </ToggleGroupItem>

              <div className=" w-[2px] h-6 bg-gradient-to-b from-sky-600/20 via-purple-600/20 to-red-600/20 self-center mx-2 " />

              <ToggleGroupItem
                value="group"
                aria-label="Group"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-muted/50 data-[state=on]:bg-gradient-to-r data-[state=on]:from-purple-500/10 data-[state=on]:to-blue-500/10 data-[state=on]:text-foreground data-[state=on]:shadow-sm data-[state=on]:ring-1 data-[state=on]:ring-blue-500/20"
              >
                <Users className="h-4 w-4" />
                Group
              </ToggleGroupItem>
            </ToggleGroup>
            {/* Conditional Avatar Stack */}
            {chatMode === 'group' && (
              <div className="flex items-center -space-x-2">
                {groupUsers.slice(0, 3).map(
                  (
                    user // Show max 3 avatars + overflow
                  ) => (
                    <Avatar
                      key={user.id}
                      className="h-8 w-8 border-2 border-background"
                    >
                      <AvatarImage
                        src={user.src ?? undefined}
                        alt={user.name}
                      />
                      <AvatarFallback className="text-xs">
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )
                )}
                {groupUsers.length > 3 && (
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarFallback className="text-xs">
                      +{groupUsers.length - 3}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            )}
            {/* You might add SettingsPanelTrigger back here if needed */}
          </div>
        </div>
      </div>
      <ScrollArea className="p-2 flex-1 w-full">
        <div className="h-full flex flex-col px-4 md:px-6 lg:px-8">
          {/* Chat */}
        </div>
        {/* Chat */}
        <div className="relative grow">
          {/* Chat message content */}
          <div className="max-w-3xl mx-auto mt-6 space-y-6">
            {/* ... Messages ... */}
            <div className="text-center my-8">
              <div className="inline-flex items-center gap-1.5 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-full border border-blue-400/50 dark:border-blue-500/50 shadow-sm text-xs font-medium py-1.5 px-3.5 text-foreground/90 dark:text-foreground/80 transition-all hover:border-blue-500/70 dark:hover:border-blue-600/70">
                <RiShining2Line
                  className="text-blue-500/80 dark:text-blue-400/80 -ms-0.5"
                  size={14}
                  aria-hidden="true"
                />
                Today
              </div>
            </div>
            <ChatMessage isUser>
              <p>Hey Ebru, what's up?</p>
            </ChatMessage>
            <ChatMessage>
              <p>I'm good, thanks! How about you?</p>
              <p>I am eating well and I had a great workout yesterday.</p>
            </ChatMessage>
            <ChatMessage isUser>
              <p>
                I'm glad to hear that! I'm working on a new project at work.
              </p>
              <p>
                I'm also thinking about getting a new laptop. What do you think?
              </p>
            </ChatMessage>
            <ChatMessage isUser>
              <p>Sounds like you're busy! I'm just checking in.</p>
            </ChatMessage>
            <ChatMessage isUser>
              <p>Anything planned for the weekend?</p>
            </ChatMessage>
            <ChatMessage>
              <p>
                I'm thinking of going to the gym and then maybe grabbing a
                coffee with Funda.
              </p>
              <p>Or maybe a tea with her.</p>
            </ChatMessage>
            <ChatMessage isUser>
              <p>Sounds like a plan! I'm sure you'll have a great time.</p>
            </ChatMessage>
            <ChatMessage isUser>
              <p>What about you?</p>
            </ChatMessage>
            <ChatMessage>
              <p>I will read a book and maybe go for a walk.</p>
              <p>Or just watch a movie.</p>
            </ChatMessage>
            <ChatMessage>
              <p>Which film?</p>
              <p>I'm thinking of watching The Dark Knight.</p>
            </ChatMessage>
            <ChatMessage isUser>
              <p>I'm sure you'll enjoy it.</p>
            </ChatMessage>
            <ChatMessage isUser>
              <p>Have you heard something about Filiz?</p>
            </ChatMessage>
            <ChatMessage>
              <p>No, I haven't. What's up?</p>
            </ChatMessage>
            <ChatMessage isUser>
              <p>I'm not sure. I'm just curious.</p>
            </ChatMessage>
            <ChatMessage isUser>
              <p>Oh, no problem.</p>
            </ChatMessage>

            <div ref={messagesEndRef} aria-hidden="true" />
          </div>
        </div>{' '}
      </ScrollArea>{' '}
      {/* Footer */}
      <div className=" p-2 sticky bottom-0 pt-4 md:pt-8 z-50">
        <div className="max-w-3xl mx-auto bg-background rounded-[20px] pb-4 md:pb-8">
          <div className="relative rounded-[20px] backdrop-blur-md bg-gradient-to-t from-background to-blue-500/5 bg-blue-500/10 dark:bg-black/10 border border-white/20 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
            <TextareaAutosize
              // Removed fixed height class like sm:min-h-[84px]
              className="flex w-full resize-none border-0 bg-transparent px-4 py-3 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:ring-0 focus-visible:outline-none disabled:cursor-not-allowed" // Keep other styles, ensure resize-none is present
              placeholder="Ask me anything... (Shift+Enter for newline)" // Updated placeholder
              aria-label="Enter your prompt"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              minRows={1} // Minimum height of 1 row
              maxRows={6} // Maximum height of 6 rows before scrolling starts *within* the textarea
              // Add any other textarea props you need
            />
            {/* Textarea buttons */}
            <div className="flex items-center justify-between gap-2 p-3">
              {/* Left buttons */}
              <div className="flex items-center gap-1">
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full size-8 border-none bg-gradient-to-br from-blue-500/20 to-purple-500/20 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all"
                        aria-label="Attach file"
                      >
                        <RiAttachment2
                          className="text-muted-foreground size-5"
                          size={20}
                          aria-hidden="true"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      <p>Attach File</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full size-8 border-none bg-gradient-to-br from-blue-500/20 to-purple-500/20 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        aria-label="Audio"
                      >
                        <RiMicLine
                          className="text-muted-foreground size-5"
                          size={20}
                          aria-hidden="true"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      <p>RecordAudio</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider delayDuration={100}>
                  <DropdownMenu>
                    {/* Wrap the actual button in TooltipTrigger AND DropdownMenuTrigger */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="flex items-center rounded-full h-8 px-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/20 text-muted-foreground hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all text-sm font-medium"
                            aria-label={`Current model: ${currentModel}. Click to change.`}
                          >
                            <RiCpuLine
                              className="size-4 mr-1.5 flex-shrink-0 text-blue-400"
                              aria-hidden="true"
                            />
                            <span className="truncate max-w-[100px] sm:max-w-[150px]">
                              {currentModel}
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center">
                        <p>Select Model</p>
                      </TooltipContent>
                    </Tooltip>

                    <DropdownMenuContent
                      className="w-64 backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                      align="end"
                      side="top"
                    >
                      <DropdownMenuLabel className="text-muted-foreground">
                        Select Model
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup
                        value={currentModel}
                        onValueChange={setCurrentModel}
                      >
                        {models.map((model) => (
                          <DropdownMenuRadioItem
                            className="text-muted-foreground hover:bg-blue-500/20 focus:bg-blue-500/30 flex justify-between items-center"
                            key={model}
                            value={model}
                          >
                            <span>{model}</span>
                            <span className="text-xs opacity-70">
                              {model === 'GPT-4 Omni'
                                ? 'Advanced reasoning'
                                : model === 'Claude 3 Opus'
                                ? 'Creative writing'
                                : model === 'Llama 3 70B'
                                ? 'Open-source power'
                                : 'Fast responses'}
                            </span>
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipProvider>
              </div>

              {/* Right buttons */}
              <div className="flex items-center gap-2">
                {/* Model Switcher using DropdownMenu */}

                {/* Send Button */}
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        className={cn(
                          'flex-shrink-0 rounded-full size-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-gray-200 disabled:opacity-50'
                        )}
                        disabled={!input.trim()}
                        onClick={handleSend}
                        aria-label="Send message"
                      >
                        <RiArrowUpLine size={18} aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      <p>Send Message</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
