var DB = (function () {
    var EV_KEY = 'th_eventos';
    var PO_KEY = 'th_posts';

    function safe(key) {
        try { return JSON.parse(localStorage.getItem(key) || '[]'); }
        catch (e) { return []; }
    }

    function getEventos()     { return safe(EV_KEY); }
    function saveEventos(a)   { localStorage.setItem(EV_KEY, JSON.stringify(a)); }
    function addEvento(ev)    { var a = getEventos(); a.push(ev); saveEventos(a); }
    function deleteEvento(id) { saveEventos(getEventos().filter(function (e) { return e.id !== id; })); }

    function getPosts()       { return safe(PO_KEY); }
    function savePosts(a)     { localStorage.setItem(PO_KEY, JSON.stringify(a)); }
    function addPost(p)       { var a = getPosts(); a.push(p); savePosts(a); }
    function deletePost(id)   { savePosts(getPosts().filter(function (p) { return p.id !== id; })); }

    return {
        getEventos: getEventos, addEvento: addEvento, deleteEvento: deleteEvento,
        getPosts: getPosts,     addPost: addPost,     deletePost: deletePost
    };
}());
