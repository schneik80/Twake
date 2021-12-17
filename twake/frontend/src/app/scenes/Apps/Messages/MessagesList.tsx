import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useChannelMessages } from 'app/state/recoil/hooks/messages/useChannelMessages';
import ListBuilder from './ListBuilder';
import TimeSeparator from './Message/TimeSeparator';
import MessageWithReplies from './Message/MessageWithReplies';
import FirstMessage from './Message/Parts/FirstMessage/FirstMessage';
import LockedHistoryBanner from 'app/components/LockedFeaturesComponents/LockedHistoryBanner/LockedHistoryBanner';
import MessageHistoryService from 'app/services/Apps/Messages/MessageHistoryService';
import { useCurrentCompany } from 'app/state/recoil/hooks/useCompanies';

type Props = {
  companyId: string;
  workspaceId?: string;
  channelId?: string;
  threadId?: string;
};

export const MessagesListContext = React.createContext({ hideReplies: false, withBlock: false });

export default ({ channelId, companyId, workspaceId, threadId }: Props) => {
  const { messages, loadMore, window } = useChannelMessages({
    companyId,
    workspaceId: workspaceId || '',
    channelId: channelId || '',
  });

  const { company } = useCurrentCompany();

  return (
    <MessagesListContext.Provider value={{ hideReplies: false, withBlock: true }}>
      <ListBuilder
        items={messages}
        itemId={m => m.threadId}
        emptyListComponent={<FirstMessage />}
        itemContent={(index, m) => {
          const currentIndex = messages.map(m => m.threadId).indexOf(m.threadId);
          const previous = messages[currentIndex - 1];

          let head = <></>;
          if (window.reachedStart && currentIndex === 0) {
            head = <FirstMessage />;
          }

          if (MessageHistoryService.shouldLimitMessages(company, window.start, messages.length)) {
            head = <LockedHistoryBanner />;
          }

          return (
            <div key={m.threadId}>
              {head}
              <TimeSeparator
                key={previous?.threadId || m?.threadId}
                messageId={m}
                previousMessageId={previous}
                unreadAfter={0}
              />
              <MessageWithReplies companyId={m.companyId} threadId={m.threadId} />
            </div>
          );
        }}
        loadMore={loadMore}
      />
    </MessagesListContext.Provider>
  );
};