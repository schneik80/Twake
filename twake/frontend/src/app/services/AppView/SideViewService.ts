import AppViewService, { ViewConfiguration } from './AppViewService';

class _SideViewService extends AppViewService {
  public getViewType(): 'channel_thread' | '' {
    return this.getConfiguration()?.context?.viewType || '';
  }

  public getViewCollection() {
    return this.getConfiguration().collection;
  }

  public select(id: string, configuration?: ViewConfiguration) {
    super.select(id, configuration);
  }
}

const SideViewService = new _SideViewService();
export default SideViewService;
