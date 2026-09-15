/**
 * Story modeli — Mini App bosh sahifasidagi storylar.
 */
const { prisma } = require('../database/connection');

const StoryModel = {
  listActive() {
    return prisma.story.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  },

  listAll() {
    return prisma.story.findMany({ orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] });
  },

  create(data) {
    return prisma.story.create({ data });
  },

  update(id, data) {
    return prisma.story.update({ where: { id: Number(id) }, data });
  },

  remove(id) {
    return prisma.story.delete({ where: { id: Number(id) } });
  },
};

module.exports = StoryModel;
