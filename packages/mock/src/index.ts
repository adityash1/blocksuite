/// <reference types="@blocksuite/global" />
import { sha } from '@blocksuite/global/utils';
import bodyParser from 'body-parser';
import express from 'express';

const PORT: number = +(process.env.PORT ?? 3000);

const app = express();
app.use(
  bodyParser.raw({
    limit: '50mb',
  })
);

const cache = {} as Record<string, Record<string, Buffer>>;

app.put('/api/workspace/:roomId/blob', (req, res) => {
  const roomId = req.params.roomId;
  if (!cache[roomId]) {
    cache[roomId] = {};
  }
  const binary = Buffer.from(req.body);
  sha(binary).then(blobId => {
    console.log('upload blob:', blobId);
    cache[roomId][blobId] = binary;
    res.status(200);
  });
});
app.get('/api/workspace/:roomId/blob/:blobId', (req, res) => {
  const roomId = req.params.roomId;
  const blobId = req.params.blobId;
  if (cache[roomId]?.[blobId]) {
    console.log('blob find', blobId);
    const blob = cache[roomId][blobId];
    res.type('application/json');
    res.write(blob);
    res.status(200).end();
  } else {
    res.status(404).end();
  }
});

app.listen(PORT);
