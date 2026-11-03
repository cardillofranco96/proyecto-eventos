import * as usersDao from '../dao/users.dao.js';

const usersRepository = {
  getByEmail(email) {
    return usersDao.getByEmail(email);
  },
  save(userData) {
    return usersDao.save(userData);
  }
};

export default usersRepository;