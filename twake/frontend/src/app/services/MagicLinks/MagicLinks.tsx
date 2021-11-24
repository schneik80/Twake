import Api from 'app/services/Api';


export type MagicLinksGeneratorResponse = {
  token: string
}

export class MagicLinksGeneratorService {

  constructor(protected companyId: string, protected workspaceId: string, protected loading = (arg: boolean) => { }) { }

  private route = `/internal/services/workspaces/v1/companies/${this.companyId}/workspaces/${this.workspaceId}/users/tokens`;

  getCurrentTokens(): Promise<MagicLinksGeneratorResponse[] | null> {
      this.loading(true);
      return Api.get<{ resources: MagicLinksGeneratorResponse[] }>(this.route).then((a) => (a.resources) ? a.resources : null).finally(() => this.loading(false));
  }

  recreateToken(): Promise<MagicLinksGeneratorResponse> {
      this.loading(true);
      return Api.post<any, { resource: MagicLinksGeneratorResponse }>(this.route, {}).then(a => a.resource).finally(() => this.loading(false));
  }

  deleteToken(token: string): Promise<undefined> {
      this.loading(true);
      return Api.delete(`${this.route}/${token}`).then(a => undefined).finally(() => this.loading(false));
  }
}


export type MagicLinksJoinResponse = {
  company: {
    id: string,
    name: string
  },
  workspace: {
    id: string
    name: string
  },
  auth_url: string
}

export class MagicLinksJoinService {

  private route = `/internal/services/workspaces/v1/join`;
  constructor(protected token: string, protected loading = (arg: boolean) => { }) { }

  private process(join: boolean): Promise<MagicLinksJoinResponse> {
    this.loading(true);
    return Api.post<{}, { resource: MagicLinksJoinResponse }>(this.route, { join, token: this.token }).then(a => {
      if (!a.resource) {
        throw new Error("Token not found");
      }
      return a.resource;
    }).finally(() => { this.loading(false); });
  }

  getInfo(): Promise<MagicLinksJoinResponse> {
    return this.process(false);
  }

  join(): Promise<MagicLinksJoinResponse> {
    return this.process(true);
  }

}

