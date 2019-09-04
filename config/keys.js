dbPassword = 'mongodb+srv://MONGODBURI:' + encodeURIComponent('YOUR_MONGODB_PASSWORD') + '@NAME_OF_CLUSTER-oohca.mongodb.net/NAME_OF_DATABASE?retryWrites=true&w=majority';

module.exports = {
    mongoURI: dbPassword
};
