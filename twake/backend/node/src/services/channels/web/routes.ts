import { FastifyInstance, FastifyPluginCallback } from "fastify";
import { BaseChannelsParameters, ChannelParameters, PaginationQueryParameters } from "./types";
import {
  createChannelMemberSchema,
  createChannelSchema,
  getChannelMemberSchema,
  getChannelSchema,
  updateChannelMemberSchema,
  updateChannelSchema,
} from "./schemas";
import {
  ChannelCrudController,
  ChannelMemberCrudController,
  ChannelTabCrudController,
} from "./controllers";
import ChannelServiceAPI from "../provider";
import { checkCompanyAndWorkspaceForUser } from "./middleware";
import { FastifyRequest } from "fastify/types/request";
import { RealtimeServiceAPI } from "../../../core/platform/services/realtime/api";

const channelsUrl = "/companies/:company_id/workspaces/:workspace_id/channels";
const membersUrl = `${channelsUrl}/:id/members`;
const tabsUrl = `${channelsUrl}/:id/tabs`;
const pendingEmailsUrl = `${channelsUrl}/:channel_id/pending_emails`;

const routes: FastifyPluginCallback<{
  service: ChannelServiceAPI;
  realtime: RealtimeServiceAPI;
}> = (fastify: FastifyInstance, options, next) => {
  const channelsController = new ChannelCrudController(
    options.realtime,
    options.service.channels,
    options.service.members,
    options.service.pendingEmails,
  );
  const membersController = new ChannelMemberCrudController(
    options.realtime,
    options.service.members,
  );
  const tabsController = new ChannelTabCrudController(options.realtime, options.service.tabs);

  const accessControl = async (request: FastifyRequest<{ Params: BaseChannelsParameters }>) => {
    const authorized = await checkCompanyAndWorkspaceForUser(
      request.params.company_id,
      request.params.workspace_id,
    );

    if (!authorized) {
      throw fastify.httpErrors.badRequest("Invalid company/workspace");
    }
  };

  const validateQuery = async (
    request: FastifyRequest<{
      Params: BaseChannelsParameters;
      Querystring: PaginationQueryParameters;
    }>,
  ) => {
    if (isNaN(+request.query.limit)) {
      request.query.limit = "100";
    }
  };

  // channels
  fastify.route({
    method: "GET",
    url: channelsUrl,
    preHandler: [accessControl, validateQuery],
    preValidation: [fastify.authenticate],
    handler: channelsController.list.bind(channelsController),
  });

  fastify.route({
    method: "GET",
    url: `${channelsUrl}/:id`,
    preHandler: accessControl,
    preValidation: [fastify.authenticate],
    schema: getChannelSchema,
    handler: channelsController.get.bind(channelsController),
  });

  fastify.route({
    method: "POST",
    url: channelsUrl,
    preHandler: accessControl,
    preValidation: [fastify.authenticate],
    schema: createChannelSchema,
    handler: channelsController.save.bind(channelsController),
  });

  fastify.route({
    method: "POST",
    url: `${channelsUrl}/:id`,
    preHandler: accessControl,
    preValidation: [fastify.authenticate],
    schema: updateChannelSchema,
    handler: channelsController.update.bind(channelsController),
  });

  fastify.route<{ Params: ChannelParameters }>({
    method: "DELETE",
    url: `${channelsUrl}/:id`,
    preHandler: accessControl,
    preValidation: [fastify.authenticate],
    handler: channelsController.delete.bind(channelsController),
  });

  fastify.route<{ Params: ChannelParameters }>({
    method: "POST",
    url: `${channelsUrl}/:id/read`,
    preHandler: accessControl,
    preValidation: [fastify.authenticate],
    handler: channelsController.updateRead.bind(channelsController),
  });

  // members

  fastify.route({
    method: "GET",
    url: membersUrl,
    preHandler: accessControl,
    preValidation: [fastify.authenticate],
    handler: membersController.list.bind(membersController),
  });

  fastify.route({
    method: "POST",
    url: membersUrl,
    preHandler: accessControl,
    preValidation: [fastify.authenticate],
    schema: createChannelMemberSchema,
    handler: membersController.save.bind(membersController),
  });

  fastify.route({
    method: "GET",
    url: `${membersUrl}/:member_id`,
    preHandler: accessControl,
    preValidation: [fastify.authenticate],
    schema: getChannelMemberSchema,
    handler: membersController.get.bind(membersController),
  });

  fastify.route({
    method: "POST",
    url: `${membersUrl}/:member_id`,
    preHandler: accessControl,
    preValidation: [fastify.authenticate],
    schema: updateChannelMemberSchema,
    handler: membersController.update.bind(membersController),
  });

  fastify.route({
    method: "DELETE",
    url: `${membersUrl}/:member_id`,
    preHandler: accessControl,
    preValidation: [fastify.authenticate],
    handler: membersController.delete.bind(membersController),
  });

  // pending_emails

  fastify.route({
    method: "GET",
    url: pendingEmailsUrl,
    preHandler: [accessControl, validateQuery],
    preValidation: [fastify.authenticate],
    //schema: getChannelPendingEmailsSchema,
    handler: channelsController.findPendingEmails.bind(channelsController),
  });

  fastify.route({
    method: "POST",
    url: pendingEmailsUrl,
    preHandler: accessControl,
    preValidation: [fastify.authenticate],
    //schema: createChannelPendingEmailsSchema,
    handler: channelsController.savePendingEmails.bind(channelsController),
  });

  fastify.route({
    method: "DELETE",
    url: `${pendingEmailsUrl}/:email`,
    preHandler: accessControl,
    preValidation: [fastify.authenticate],
    handler: channelsController.deletePendingEmails.bind(channelsController),
  });

  // tabs

  fastify.route({
    method: "GET",
    url: tabsUrl,
    preHandler: accessControl,
    preValidation: [fastify.authenticate],
    handler: tabsController.list.bind(tabsController),
  });

  fastify.route({
    method: "POST",
    url: tabsUrl,
    preHandler: accessControl,
    preValidation: [fastify.authenticate],
    handler: tabsController.save.bind(tabsController),
  });

  fastify.route({
    method: "GET",
    url: `${tabsUrl}/:tab_id`,
    preHandler: accessControl,
    preValidation: [fastify.authenticate],
    handler: tabsController.get.bind(tabsController),
  });

  fastify.route({
    method: "POST",
    url: `${tabsUrl}/:tab_id`,
    preHandler: accessControl,
    preValidation: [fastify.authenticate],
    handler: tabsController.update.bind(tabsController),
  });

  fastify.route({
    method: "DELETE",
    url: `${tabsUrl}/:tab_id`,
    preHandler: accessControl,
    preValidation: [fastify.authenticate],
    handler: tabsController.delete.bind(tabsController),
  });

  next();
};

export default routes;
