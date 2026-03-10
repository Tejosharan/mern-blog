const express = require('express');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');
const router = express.Router();

// GET /api/posts - all posts
router.get('/', async (req, res) => {
  try {
    const { tag, search } = req.query;
    let query = {};
    if (tag) query.tags = tag;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
    const posts = await Post.find(query).populate('author', 'username').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/posts/:id
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username').populate('comments.user', 'username');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/posts
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, excerpt, tags } = req.body;
    const post = await Post.create({ title, content, excerpt, tags, author: req.user._id });
    res.status(201).json(post);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/posts/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    const updated = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/posts/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/posts/:id/like
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const liked = post.likes.includes(req.user._id);
    if (liked) post.likes.pull(req.user._id);
    else post.likes.push(req.user._id);
    await post.save();
    res.json({ likes: post.likes.length, liked: !liked });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/posts/:id/comments
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.comments.push({ user: req.user._id, text: req.body.text });
    await post.save();
    await post.populate('comments.user', 'username');
    res.status(201).json(post.comments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
