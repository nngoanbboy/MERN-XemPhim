const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  server_name: String,
  server_data: [{
    name: String,
    slug: String,
    filename: String,
    link_embed: String,
    link_m3u8: String,
  }],
});

module.exports = mongoose.model('Episode', episodeSchema);
