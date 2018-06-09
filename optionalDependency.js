const codependency = require('codependency');
var requirePeer;

// As codependency requires registering with the root module, 
// it must be initialized within index.js. Therefore this package
// is used to set it up in index.js and be invoked in individual 
// stores. 
module.exports = {
    setRoot: rootModule=>requirePeer = codependency.register(rootModule),
    require: package=>requirePeer(package)
}

