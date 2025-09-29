const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is missing'],
    minLength: [3, 'Name must be at least 3 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is missing'],
    minLength: [3, 'Username must be at least 3 characters'],
    unique: [true, 'This username is already in use']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is missing'],
    minLength: [true, 'Password must be at least 3 characters']
  },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ]
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();

    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  }
})

const User = mongoose.model('User', userSchema);

module.exports = User;