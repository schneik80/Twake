import { FastifyInstance, FastifyPluginCallback } from "fastify";
import { FileServiceAPI } from "../api";
import { FileController } from "./controllers/files";
import { File } from "../entities/file";

const filesUrl = "/companies/:company_id/files";

const routes: FastifyPluginCallback<{ service: FileServiceAPI }> = (
  fastify: FastifyInstance,
  options,
  next,
) => {
  const fileController = new FileController(options.service);

  fastify.route({
    method: "POST",
    url: filesUrl,
    preValidation: [fastify.authenticate],
    handler: fileController.save.bind(fileController),
  });

  fastify.route({
    method: "POST",
    url: `${filesUrl}/:id`,
    preValidation: [fastify.authenticate],
    handler: fileController.save.bind(fileController),
  });

  fastify.route({
    method: "GET",
    url: `${filesUrl}/:id/download`,
    handler: fileController.download.bind(fileController),
  });

  fastify.route({
    method: "GET",
    url: `${filesUrl}/:id`,
    preValidation: [fastify.authenticate],
    handler: fileController.get.bind(fileController),
  });

  fastify.route({
    method: "GET",
    url: `${filesUrl}/:id/thumbnails/:index`,
    handler: fileController.thumbnail.bind(fileController),
  });

  fastify.route({
    method: "DELETE",
    url: `${filesUrl}/:id`,
    preValidation: [fastify.authenticate],
    handler: fileController.delete.bind(fileController),
  });

  next();
};

export const getDownloadRoute = (file: File) => {
  return filesUrl.replace(":company_id", file.company_id) + `/${file.id}/download`;
};

export const getThumbnailRoute = (file: File, index: string) => {
  return filesUrl.replace(":company_id", file.company_id) + `/${file.id}/thumbnails/${index}`;
};

export default routes;
