import express from 'express';
import { upload, soundsDir } from './sound-upload.js';
import path from 'path';
import fs from 'fs';
import { prisma } from '../../db.js';
import { Soundboard } from './soundboard.js';

const router = express.Router();

// CREATE sound
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { title, author, category, volume } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Sound file is required' });

    const sound = await prisma.sound.create({
      data: {
        title,
        author,
        category,
        filename: req.file.filename,
        volume: volume ? Number(volume) : 1,
      },
    });
    res.json(sound);

    Soundboard.instance.soundboardSocketServer.addSound(sound);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// EDIT sound
router.put('/:id', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, category, volume } = req.body;

    const existingSound = await prisma.sound.findUnique({ where: { id: Number(id) } });
    if (!existingSound) return res.status(404).json({ error: 'Sound not found' });

    let filename = existingSound.filename;
    if (req.file) {
      // delete old file
      const oldPath = path.join(soundsDir, existingSound.filename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      filename = req.file.filename;
    }

    const updatedSound = await prisma.sound.update({
      where: { id: Number(id) },
      data: { title, author, category, filename, volume: volume ? Number(volume) : existingSound.volume },
    });

    res.json(updatedSound);

    Soundboard.instance.soundboardSocketServer.editSound(updatedSound);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE sound
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sound = await prisma.sound.findUnique({ where: { id: Number(id) } });
    if (!sound) return res.status(404).json({ error: 'Sound not found' });

    // Delete file
    const filePath = path.join(soundsDir, sound.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.sound.delete({ where: { id: Number(id) } });
    res.json({ message: 'Sound deleted' });

    Soundboard.instance.soundboardSocketServer.deleteSound(sound.id);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET all sounds
router.get('/', async (_req, res) => {
  try {
    const sounds = await prisma.sound.findMany();
    res.json(sounds);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET sound file
router.get('/file/:filename', (req, res) => {
  const filePath = path.join(soundsDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

export default router;
