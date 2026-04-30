// Firebase config — substitua pelos valores do seu projeto Firebase
var FIREBASE_CONFIG = {
    apiKey:            "AIzaSyDXx7JPS2oOiDEmMlf5nnkUYEvubWoT4s8",
    authDomain:        "tickethubbh.firebaseapp.com",
    projectId:         "tickethubbh",
    storageBucket:     "tickethubbh.firebasestorage.app",
    messagingSenderId: "121014876387",
    appId:             "1:121014876387:web:30408ae3e045be87642dd6",
    measurementId:     "G-GHT9ZLMV35"
};

var DB = (function () {

    // ── cache em memória ──────────────────────────────────────────────────────
    var _eventos = [];
    var _posts   = [];
    var _albuns  = [];
    var _ready   = false;
    var _cbs     = [];       // callbacks aguardando onReady
    var _db      = null;     // instância Firestore

    // ── inicialização ─────────────────────────────────────────────────────────
    function _init() {
        if (!firebase.apps.length) {
            firebase.initializeApp(FIREBASE_CONFIG);
        }
        _db = firebase.firestore();

        var loaded = { ev: false, po: false, al: false };
        function check() {
            if (loaded.ev && loaded.po && loaded.al) {
                _ready = true;
                _cbs.forEach(function (cb) { cb(); });
                _cbs = [];
            }
        }

        _db.collection('eventos').orderBy('_ts', 'asc').get().then(function (snap) {
            _eventos = snap.docs.map(function (d) { return d.data(); });
            loaded.ev = true;
            check();
        }).catch(function () { loaded.ev = true; check(); });

        _db.collection('posts').orderBy('_ts', 'asc').get().then(function (snap) {
            _posts = snap.docs.map(function (d) { return d.data(); });
            loaded.po = true;
            check();
        }).catch(function () { loaded.po = true; check(); });

        _db.collection('albuns').orderBy('_ts', 'asc').get().then(function (snap) {
            _albuns = snap.docs.map(function (d) { return d.data(); });
            loaded.al = true;
            check();
        }).catch(function () { loaded.al = true; check(); });
    }

    // ── onReady ───────────────────────────────────────────────────────────────
    function onReady(cb) {
        if (_ready) { cb(); } else { _cbs.push(cb); }
    }

    // ── helpers ───────────────────────────────────────────────────────────────
    function _set(col, id, data) {
        return _db.collection(col).doc(id).set(data);
    }
    function _del(col, id) {
        return _db.collection(col).doc(id).delete();
    }

    // ── Eventos ───────────────────────────────────────────────────────────────
    function getEventos()     { return _eventos.slice(); }

    function addEvento(ev, cb) {
        ev._ts = Date.now();
        _set('eventos', ev.id, ev).then(function () {
            _eventos.push(ev);
            if (cb) cb(null);
        }).catch(function (err) { if (cb) cb(err); });
    }

    function deleteEvento(id, cb) {
        _del('eventos', id).then(function () {
            _eventos = _eventos.filter(function (e) { return e.id !== id; });
            if (cb) cb(null);
        }).catch(function (err) { if (cb) cb(err); });
    }

    // ── Posts ─────────────────────────────────────────────────────────────────
    function getPosts()     { return _posts.slice(); }

    function addPost(p, cb) {
        p._ts = Date.now();
        _set('posts', p.id, p).then(function () {
            _posts.push(p);
            if (cb) cb(null);
        }).catch(function (err) { if (cb) cb(err); });
    }

    function deletePost(id, cb) {
        _del('posts', id).then(function () {
            _posts = _posts.filter(function (p) { return p.id !== id; });
            if (cb) cb(null);
        }).catch(function (err) { if (cb) cb(err); });
    }

    // ── Álbuns ────────────────────────────────────────────────────────────────
    function getAlbuns()     { return _albuns.slice(); }

    function addAlbum(al, cb) {
        al._ts = Date.now();
        _set('albuns', al.id, al).then(function () {
            _albuns.push(al);
            if (cb) cb(null);
        }).catch(function (err) { if (cb) cb(err); });
    }

    function deleteAlbum(id, cb) {
        _del('albuns', id).then(function () {
            _albuns = _albuns.filter(function (a) { return a.id !== id; });
            if (cb) cb(null);
        }).catch(function (err) { if (cb) cb(err); });
    }

    // ── arrancar ──────────────────────────────────────────────────────────────
    _init();

    return {
        onReady:       onReady,
        getEventos:    getEventos,
        addEvento:     addEvento,
        deleteEvento:  deleteEvento,
        getPosts:      getPosts,
        addPost:       addPost,
        deletePost:    deletePost,
        getAlbuns:     getAlbuns,
        addAlbum:      addAlbum,
        deleteAlbum:   deleteAlbum
    };
}());
