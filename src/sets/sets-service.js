const SetsService = {
    getAllSets(db) {
      return db('sets')
        .select('*');
    },
  
    insertSet(db, data) {
      return db('sets')
        .insert(data)
        .returning('*')
        .then(rows => rows[0]);
    },
  
    getSetById(db, id) {
      return db('sets')
        .select('*')
        .where({ id })
        .first();
    },
  
    deleteSet(db, id) {
      return db('sets')
        .where({ id })
        .delete();
    },
  
    updateSet(db, id, data) {
      return db('sets')
        .where({ id })
        .update(data);
    }
  };
  
  module.exports = SetsService;