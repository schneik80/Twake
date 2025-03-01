import { MessageWithReplies } from 'app/models/Message';
import { TwakeService } from '../../../Decorators/TwakeService';
import Api from 'app/services/Api';
import { WebsocketRoom } from 'app/services/WebSocket/WebSocket';

/**
 * This service is to get messages using views.
 * A view can be:
 *  - channel feed view
 *  - channel pinned messages view
 *  - my active threads view
 *  - ...
 */
@TwakeService('MessageViewAPIClientService')
class MessageViewAPIClient {
  private readonly prefixUrl: string = '/internal/services/messages/v1';
  private realtime: Map<string, WebsocketRoom[]> = new Map();

  feedWebsockets(channelId: string): WebsocketRoom[] {
    return this.realtime.get('feed-' + channelId) || [];
  }

  async feed(
    companyId: string,
    workspaceId: string,
    channelId: string,
    { repliesPerThread = 5, limit = 25, pageToken = '', direction = 'future' } = {},
  ) {
    const response = await Api.get<{
      resources: MessageWithReplies[];
      websockets: WebsocketRoom[];
    }>(
      `${this.prefixUrl}/companies/${companyId}/workspaces/${workspaceId}/channels/${channelId}/feed?replies_per_thread=${repliesPerThread}&limit=${limit}&include_users=1&page_token=${pageToken}&direction=${direction}&websockets=1`,
    );
    this.realtime.set('feed-' + channelId, response.websockets);
    return response.resources;
  }
}

export default new MessageViewAPIClient();
