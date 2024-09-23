const Genre = require("../models/genreModel");
const slugify = require("slugify");

slugify.extend({
  đ: "d",
  Đ: "D",
  ă: "a",
  Ă: "A",
  â: "a",
  Â: "A",
  ê: "e",
  Ê: "E",
  ô: "o",
  Ô: "O",
  ơ: "o",
  Ơ: "O",
  ư: "u",
  Ư: "U",
});
//Tạo thể loại
exports.createGenre = async (req, res) => {
  try {
    const { name } = req.body;
    const slug = slugify(name, { lower: true, strict: true, locale: "vi" });

    const newGenre = new Genre({ name, slug });
    const savedGenre = await newGenre.save();

    res.status(201).json({
      status: true,
      msg: "Genre created successfully",
      genre: savedGenre,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to create Genre",
      error: err.message,
    });
  }
};
//Lấy tất cả thể loại
exports.getAllGenres = async (req, res) => {
  try {
    const genres = await Genre.find();
    res.json({ status: true, genres });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to fetch genres",
      error: err.message,
    });
  }
};
//Lấy thể loại theo ID
exports.getGenreById = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);
    if (!genre) {
      return res.status(404).json({ status: false, msg: "Genre not found" });
    }
    res.json({ status: true, genre });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to fetch genre",
      error: err.message,
    });
  }
};
//Cập nhật thể loại
exports.updateGenre = async (req, res) => {
  try {
    const { name } = req.body;
    const slug = slugify(name, {
      lower: true,
      strict: true,
      locale: "vi",
    });

    const updatedGenre = await Genre.findByIdAndUpdate(
      req.params.id,
      { name, slug },
      { new: true }
    );

    if (!updatedGenre) {
      return res.status(404).json({ status: false, msg: "Genre not found" });
    }

    res.json({
      status: true,
      msg: "Genre updated successfully",
      genre: updatedGenre,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to update genre",
      error: err.message,
    });
  }
};
//Xoá thể loại
exports.deleteGenre = async (req, res) => {
  try {
    const deletedGenre = await Genre.findByIdAndDelete(req.params.id);
    if (!deletedGenre) {
      return res.status(404).json({ status: false, msg: "Genre not found" });
    }
    res.json({ status: true, msg: "Genre deleted successfully" });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to delete genre",
      error: err.message,
    });
  }
};

//Lấy thể loại theo slug
exports.getGenreBySlug = async (req, res) => {
  try {
    const genre = await Genre.findOne({ slug: req.params.slug });
    if (!genre) {
      return res.status(404).json({ status: false, msg: "Genre not found" });
    }
    res.json({ status: true, genre });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to fetch genre",
      error: err.message,
    });
  }
};

//Cập nhật thể loại
exports.updateGenreId = async (req, res) => {
  try {
    const { oldId, newId } = req.body;

    // Kiểm tra xem newId đã tồn tại chưa
    const existingGenre = await Genre.findById(newId);
    if (existingGenre) {
      return res
        .status(400)
        .json({ status: false, msg: "New ID already exists" });
    }

    // Tìm thể loại cần cập nhật
    const genre = await Genre.findById(oldId);
    if (!genre) {
      return res.status(404).json({ status: false, msg: "Genre not found" });
    }

    // Tạo một bản sao của thể loại với ID mới
    const newGenre = new Genre({
      _id: newId,
      name: genre.name,
      slug: genre.slug,
      __v: genre.__v,
    });

    // Lưu thể loại mới
    await newGenre.save();

    // Xóa thể loại cũ
    await Genre.findByIdAndDelete(oldId);

    res.json({
      status: true,
      msg: "Genre ID updated successfully",
      genre: newGenre,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to update genre ID",
      error: err.message,
    });
  }
};
