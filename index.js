const request = require("request-promise-native");

// TODO: Use the query string rather than plus.

class ChatbotNLPAccess {
    constructor(uri) {
        this.uri = uri
    }
}

class ChatbotLUISAccess extends ChatbotNLPAccess{

    mostMatchingIntent(utterence) {
        let options = {uri: `${this.uri}${utterence}`, json: true};
        return request.get(options)
            .then( (res) => {return {top: res.topScoringIntent.intent, response: res}} )
            .catch( err => console.error(err));
    }

    mostMatchingIntentOf(utterence, releventIntentNames, scoreThreshold = 0.5, noMatchValue = "noMatch") {
        let options = {uri: `${this.uri}${utterence}`, json: true};
        return request.get(options)
            .then( (res) => {return {top: findTopScoringIntentOf(res, releventIntentNames, scoreThreshold), response: res}} )
            .catch( err => console.error(err));
    }

    /* Find the entity record from a luisResult given the type you are looking for. Otherwise return the no match value. */

    entity(type, luisResult, noMatchValue = { "entity": "noMatch"}) {
        const theMatch = luisResult.response.entities.find( (thisEntity) => {return (thisEntity.type) === type} );
        if ( theMatch ) {
            return theMatch;
        } else {
            return noMatchValue
        }
    }

    /* Find the entity NAME from a luisResult given the type you are looking for. Otherwise return the no match value. */

    entityName(type, luisResult, noMatchValue = "noMatch") {
        const match = this.entity(type, luisResult, noMatchValue = { "entity": noMatchValue});
        if ( match ) {
            return match.entity
        } else {
            return noMatchValue; // TODO: Raise an exception here perhaps?
        }
    }

}


// Utilities
function findTopScoringIntentOf(luisResult, releventIntentNames, scoreThreshold = 0.5, noMatchValue = "noMatch") {
    const firstMatch = luisResult.intents.find( (thisIntent) => {
        return (releventIntentNames.includes(thisIntent.intent))
            && (thisIntent.score >= scoreThreshold)
    } );
    if ( firstMatch ) {
        return firstMatch.intent;
    } else {
        return noMatchValue
    }
}

module.exports = ChatbotLUISAccess;

