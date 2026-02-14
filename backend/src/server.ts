import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuid } from 'uuid'

dotenv.config()

import postsRouter from './routes/posts.routes'
import storiesRouter from './routes/stories.routes'
import uploadRouter from './routes/upload.routes'
import studyRouter from './routes/study.routes'
import messagesRouter from './routes/messages.routes'
import shopRouter from './routes/shop.routes'
import usersRouter from './routes/users.routes'
import appointmentsRouter from './routes/appointments.routes'
import adminRouter from './routes/admin.routes'
import notificationsRouter from './routes/notifications.routes'
import meetingsRouter from './routes/meetings.routes'
import permissionsRouter from './routes/permissions.routes'
import aiRouter from './routes/ai.routes'

import path from 'path'

import { createServer } from 'http';
import { initSocket } from './socket';

const app = express()
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

app.use(cors({ origin: '*' }))
app.use(express.json())
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// ✅ Use Routes
app.use('/posts', postsRouter)
app.use('/stories', storiesRouter)
app.use('/upload', uploadRouter)
app.use('/study', studyRouter)
app.use('/messages', messagesRouter)
app.use('/shop', shopRouter)
app.use('/users', usersRouter)
app.use('/appointments', appointmentsRouter)
app.use('/admin', adminRouter)
app.use('/notifications', notificationsRouter)
app.use('/meetings', meetingsRouter)
app.use('/permissions', permissionsRouter)
app.use('/ai', aiRouter)

const PORT = process.env.PORT || 5555
const TABLE_NAME = 'Posts'

import os from 'os';

httpServer.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
  console.log(`- Local: http://localhost:${PORT}`);

  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if ('IPv4' !== iface.family || iface.internal) {
        continue;
      }
      console.log(`- Network (${name}): http://${iface.address}:${PORT}`);
    }
  }
});
