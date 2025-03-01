import React, { Suspense, useContext, useState } from 'react';
import 'moment-timezone';
import classNames from 'classnames';
import Reactions from './Reactions';
import Options from './Options';
import MessageHeader from './MessageHeader';
import WorkspacesApps from 'services/workspaces/workspaces_apps.js';
import MessageEdition from './MessageEdition';
import DeletedContent from './DeletedContent';
import RetryButtons from './RetryButtons';
import FileComponent from 'app/components/File/FileComponent';
import { Row } from 'antd';
import Globals from 'services/Globals';
import { MessageContext } from '../MessageWithReplies';
import { useMessage } from 'app/state/recoil/hooks/messages/useMessage';
import Blocks from './Blocks';
import { useVisibleMessagesEditorLocation } from 'app/state/recoil/hooks/messages/useMessageEditor';
import { ViewContext } from 'app/scenes/Client/MainView/MainContent';
import PossiblyPendingAttachment from './PossiblyPendingAttachment';
import MessageAttachments from './MessageAttachments';
import PseudoMarkdownCompiler from 'services/Twacode/pseudoMarkdownCompiler';

type Props = {
  linkToThread?: boolean;
  threadHeader?: string;
};

export default (props: Props) => {
  const [active, setActive] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [didMouseOver, setDidMouseOver] = useState(false);
  let loading_interaction_timeout: any = 0;

  const context = useContext(MessageContext);
  let { message } = useMessage(context);

  const companyId = context.companyId;

  const onInteractiveMessageAction = (action_id: string, context: any, passives: any, evt: any) => {
    var app_id = message.application_id;
    var type = 'interactive_message_action';
    var event = action_id;
    var data = {
      interactive_context: context,
      form: passives,
      message: message,
    };
    WorkspacesApps.notifyApp(app_id, type, event, data);
  };

  const onAction = (type: string, id: string, context: any, passives: any, evt: any) => {
    if (type === 'interactive_action') {
      setLoadingAction(true);
      clearTimeout(loading_interaction_timeout);
      loading_interaction_timeout = setTimeout(() => {
        setLoadingAction(false);
      }, 5000);
      onInteractiveMessageAction(id, context, passives, evt);
    }
  };

  const deleted = message.subtype === 'deleted';

  const location = `message-${message.id}`;
  const { active: editorIsActive } = useVisibleMessagesEditorLocation(
    location,
    useContext(ViewContext).type,
  );

  const showEdition = !props.linkToThread && editorIsActive;
  const messageIsLoading = (message as any)._status === 'sending';
  const messageSaveFailed = (message as any)._status === 'failed';

  return (
    <div
      className={classNames('message-content', {
        active,
        'loading-interaction': loadingAction,
        'link-to-thread': props.linkToThread,
      })}
      onMouseEnter={() => {
        setDidMouseOver(true);
      }}
      onClick={() => setActive(false)}
    >
      <MessageHeader linkToThread={props.linkToThread} />
      {!!showEdition && !deleted && (
        <div className="content-parent">
          <MessageEdition />
        </div>
      )}
      {!showEdition && (
        <div className="content-parent dont-break-out">
          {deleted === true ? (
            <div className="deleted-message">
              <DeletedContent userId={message.user_id || ''} />
            </div>
          ) : (
            <>
              <div
                className={classNames('content allow_selection', {
                  message_is_loading: messageIsLoading,
                  'message-not-sent': messageSaveFailed,
                })}
              >
                {!!props.linkToThread && message.text}
                {!props.linkToThread && (
                  <>
                    <Blocks
                      blocks={message.blocks}
                      fallback={PseudoMarkdownCompiler.transformBackChannelsUsers(message.text)}
                      onAction={(
                        type: string,
                        id: string,
                        context: any,
                        passives: any,
                        evt: any,
                      ) => {
                        onAction(type, id, context, passives, evt);
                      }}
                      allowAdvancedBlocks={message.subtype === 'application'}
                    />
                  </>
                )}
              </div>

              {message?.files && message?.files?.length > 0 && <MessageAttachments />}

              {!messageSaveFailed && <Reactions />}
              {messageSaveFailed && !messageIsLoading && <RetryButtons />}
            </>
          )}
        </div>
      )}
      {!showEdition && !deleted && !messageSaveFailed && didMouseOver && !messageIsLoading && (
        <Options
          onOpen={() => setActive(true)}
          onClose={() => setActive(false)}
          threadHeader={props.threadHeader}
        />
      )}
    </div>
  );
};
