const { Category } = require("../models");

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { userId: req.user.id },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
};

// Create category
exports.addCategory = async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;
    const category = await Category.create({
      name,
      type,
      icon,
      color,
      userId: req.user.id,
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error creating category" });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;
    const category = await Category.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.update({ name, type, icon, color });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Error updating category" });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.destroy();
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category" });
  }
};
