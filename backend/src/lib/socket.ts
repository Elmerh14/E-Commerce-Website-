import { Server } from 'socket.io'
import type { Server as HttpServer } from 'http'

let io: Server

export function initSocket(httpServer: HttpServer, clientUrl: string): Server {
  io = new Server(httpServer, {
    cors: { origin: clientUrl, credentials: true },
  })
  return io
}

export function getIO(): Server {
  return io
}
