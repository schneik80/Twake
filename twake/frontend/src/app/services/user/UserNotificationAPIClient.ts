import Api from '../Api';
import { NotificationType } from 'app/models/Notification';
import { TwakeService } from '../Decorators/TwakeService';

@TwakeService('UserNotificationAPIClientService')
class UserNotificationAPIClient {
  async getAllCompaniesBadges(): Promise<NotificationType[]> {
    return Api.get<{ resources: NotificationType[]}>(
      '/internal/services/notifications/v1/badges?all_companies=true',
    ).then(response => response.resources ? response.resources : []);
  }
}

export default new UserNotificationAPIClient();
