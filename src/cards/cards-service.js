const CardsService = {
    getAllCards(db) {
      return db('cards')
        .select('*');
    },
  
    insertCard(db, data) {
      return db('cards')
        .insert(data)
        .returning('*')
        .then(rows => rows[0]);
    },
  
    getCardById(db, id) {
      return db('cards')
        .select('*')
        .where({ id })
        .first();
    },
  
    deleteCard(db, id) {
      return db('cards')
        .where({ id })
        .delete();
    },
  
    updateCard(db, id, data) {
      return db('cards')
        .where({ id })
        .update(data);
    }
  };
  
  module.exports = CardsService;