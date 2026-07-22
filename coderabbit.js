/* ==========================================================
   TEST: Malas practicas para review de CodeRabbit
   Proposito: Este archivo contiene errores comunes que
   cometen alumnos al aprender React + Bootstrap.
   CodeRabbit deberia detectarlos y sugerir correcciones.
   ========================================================== */

/* -----------------------------------------------------
   1. VARIABLES GLOBALES — malisimo
   ----------------------------------------------------- */
var API_URL = "http://api.miapp.com/v1/"
var user = null
var counter = 0
var cosas=0

function cargarDatos() {
    var x = 10
    var y = 20
    console.log("cargando datos...")
}

/* -----------------------------------------------------
   2. HTML INSEGURO — innerHTML sin sanitizar
   ----------------------------------------------------- */
function renderComentario(comentario) {
    document.getElementById("comentarios").innerHTML +=
        "<div class='comentario'>" + comentario.texto + "</div>"
}

/* -----------------------------------------------------
   3. JAVASCRIPT — comparaciones debiles, nulos, etc
   ----------------------------------------------------- */
function validarForm() {
    var name = document.getElementById("name").value
    if (name == "") {
        alert("El nombre es obligatorio")
        return false
    }
    if (name == null) {
        console.log("nunca llegas aqui")
    }
    var pass = document.getElementById("pass").value
    if (pass.length < 6) {
        alert("pass muy corta")
    }
    document.getElementById("form").submit()
}

function sumar(a, b, c) {
    return a + b
}

function duplicado(a, a) {
    return a + a
}

/* -----------------------------------------------------
   4. IF ANIDADOS Y ELSE INNECESARIO
   ----------------------------------------------------- */
function validarUsuario(user) {
    if (user) {
        if (user.nombre) {
            if (user.nombre.length > 0) {
                if (user.edad) {
                    if (user.edad > 0) {
                        return true
                    }
                }
            }
        }
    }
    return false
}

function procesarPago(total) {
    if (total > 0) {
        return total * 1.21
    } else {
        return 0
    }
}

function buscarProducto(id) {
    var resultado = null
    if (id) {
        resultado = productos.filter(function(p) { return p.id == id })
    }
    return resultado
}

/* -----------------------------------------------------
   5. NUMEROS MAGICOS Y STRINGS MAGICOS
   ----------------------------------------------------- */
function calcularDescuento(precio) {
    return precio * 0.85
}

function mostrarMensaje(tipo) {
    if (tipo == "success") {
        alert("Operacion exitosa")
    } else if (tipo == "error") {
        alert("Ocurrio un error")
    } else if (tipo == "warning") {
        alert("Cuidado")
    } else if (tipo == "info") {
        alert("Informacion")
    }
}

function temporizador() {
    setTimeout(function() {
        alert("tiempo agotado")
    }, 5000)
}

function paginar(page) {
    if (page > 10) {
        return
    }
    fetch(API_URL + "items?page=" + page + "&limit=" + 20)
}

/* -----------------------------------------------------
   6. FUNCION LARGA CON DEMASIADAS RESPONSABILIDADES
   ----------------------------------------------------- */
function iniciarApp() {
    var usuario = JSON.parse(localStorage.getItem("usuario"))
    if (usuario) {
        document.getElementById("header").innerHTML = "Bienvenido " + usuario.nombre
        document.getElementById("loginBtn").style.display = "none"
        document.getElementById("logoutBtn").style.display = "block"
    } else {
        document.getElementById("header").innerHTML = "Invitado"
        document.getElementById("loginBtn").style.display = "block"
        document.getElementById("logoutBtn").style.display = "none"
    }
    var productos = JSON.parse(localStorage.getItem("productos"))
    if (productos) {
        var html = ""
        for (var i = 0; i < productos.length; i++) {
            html += "<div class='producto'>" +
                "<h3>" + productos[i].nombre + "</h3>" +
                "<p>" + productos[i].precio + "</p>" +
                "<button onclick='agregarCarrito(" + productos[i].id + ")'>Comprar</button>" +
                "</div>"
        }
        document.getElementById("productos").innerHTML = html
    }
    fetch(API_URL + "categorias")
        .then(function(r) { return r.json() })
        .then(function(data) {
            var opciones = "<option value=''>Seleccione</option>"
            for (var i = 0; i < data.length; i++) {
                opciones += "<option value='" + data[i].id + "'>" + data[i].nombre + "</option>"
            }
            document.getElementById("categoriaSelect").innerHTML = opciones
        })
    window.addEventListener("scroll", function() {
        var scrollTop = window.scrollY
        if (scrollTop > 200) {
            document.getElementById("backToTop").style.display = "block"
        } else {
            document.getElementById("backToTop").style.display = "none"
        }
    })
    var colores = ["rojo", "verde", "azul"]
    for (var i = 0; i < colores.length; i++) {
        var div = document.createElement("div")
        div.className = "color-item"
        div.innerHTML = colores[i]
        document.getElementById("coloresContainer").appendChild(div)
    }
    var ahora = new Date()
    document.getElementById("footer").innerHTML = "Copyright " + ahora.getFullYear()
}

/* -----------------------------------------------------
   7. TEMPLATE LITERALS — concatenacion innecesaria
   ----------------------------------------------------- */
function construirUrl(id, slug) {
    return API_URL + "productos/" + id + "/" + slug
}

function saludar(nombre, apellido) {
    return "Hola " + nombre + " " + apellido + ", bienvenido al sistema"
}

function mostrarItem(item) {
    return "<li>" + item.nombre + " - $" + item.precio + "</li>"
}

/* -----------------------------------------------------
   8. DESTRUCTURING — no usado donde ayudaria
   ----------------------------------------------------- */
function imprimirUsuario(user) {
    console.log(user.nombre)
    console.log(user.email)
    console.log(user.telefono)
    console.log(user.direccion)
}

function calcularTotal(items) {
    var total = 0
    for (var i = 0; i < items.length; i++) {
        total += items[i].precio * items[i].cantidad
    }
    return total
}

/* -----------------------------------------------------
   9. MEZCLA BOOTSTRAP 4 + 5 — clases deprecadas
   ----------------------------------------------------- */
const bootstrapHTML = `
<div class="container">
    <div class="row">
        <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <button class="btn btn-primary btn-lg" onclick="alert('hola')">
                Click me
            </button>
            <span class="badge badge-warning">!Oferta!</span>
            <div class="alert alert-danger" id="myAlert">
                <a href="#" class="close" data-dismiss="alert">&times;</a>
                Error
            </div>
            <p class="text-left">
                Texto alineado a la izquierda con clase obsoleta
            </p>
            <div class="form-group">
                <input type="text" class="form-control" placeholder="Nombre">
                <small class="form-text text-muted">Ayuda</small>
            </div>
            <table class="table table-striped">
                <thead class="thead-dark">
                    <tr><th>Nombre</th></tr>
                </thead>
                <tbody id="tablaBody"></tbody>
            </table>
        </div>
    </div>
</div>
`

/* -----------------------------------------------------
   10. HTML SEMANTICO — exceso de div, alt faltante,
       labels sin asociar
   ----------------------------------------------------- */
const htmlSemantico = `
<div id="app">
    <div class="header">
        <div class="logo">
            <div class="logo-text">Mi App</div>
        </div>
        <div class="nav">
            <div class="nav-item">Inicio</div>
            <div class="nav-item">Productos</div>
            <div class="nav-item">Contacto</div>
        </div>
    </div>
    <div class="main">
        <div class="section">
            <div class="article">
                <div class="title">Titulo del articulo</div>
                <div class="content">Contenido</div>
            </div>
        </div>
        <div class="sidebar">
            <div class="widget">
                <img src="banner.jpg">
                <label>Nombre</label>
                <input type="text" placeholder="Tu nombre">
                <label>Email</label>
                <input type="email" placeholder="Tu email">
            </div>
        </div>
    </div>
</div>
`

/* -----------------------------------------------------
   11. CSS — !important, reglas duplicadas
   ----------------------------------------------------- */
const style = document.createElement("style")
style.textContent = `
    .container {
        width: 100% !important;
        max-width: 100% !important;
        padding: 0px !important;
        margin: 0px !important;
    }
    #myAlert .close {
        color: red !important;
        font-size: 30px !important;
        font-weight: bold;
    }
    div p span a {
        color: blue !important;
        text-decoration: underline !important;
    }
    .btn {
        background-color: #007bff !important;
        border: 1px solid #007bff !important;
    }
    .btn-primary {
        background-color: blue !important;
    }
    .text-left {
        text-align: left !important;
    }
    .form-group {
        margin-bottom: 15px;
    }
    .row {
        margin-left: -15px !important;
        margin-right: -15px !important;
    }
    .container {
        padding-right: 15px;
        padding-left: 15px;
        margin-right: auto;
        margin-left: auto;
    }
    .table {
        width: 100%;
        max-width: 100%;
        margin-bottom: 1rem;
        background-color: transparent;
    }
    .producto h3 {
        color: #333 !important;
    }
    .producto h3 {
        font-size: 18px !important;
    }
    div div div p {
        margin: 0 !important;
    }
    div div div p {
        padding: 10px !important;
    }
`
document.head.appendChild(style)

/* -----------------------------------------------------
   12. REACT — componente horrible con todo mal
   ----------------------------------------------------- */
class UserProfile extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            user: null,
            loading: false,
            data: [],
            visible: true,
            count: 0,
            first: "",
            firstName: ""
        }
        this.handleClick = this.handleClick.bind(this)
        this.fetchData = this.fetchData.bind(this)
        this.renderItem = this.renderItem.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }

    componentDidMount() {
        fetch(API_URL + "users")
            .then(function(response) {
                return response.json()
            })
            .then(function(data) {
                this.setState({ data: data })
                this.state.user = data[0]
                this.state.loading = false
            })
            .catch(function(err) {
                console.log(err)
            })

        setInterval(function() {
            this.setState({ count: this.state.count + 1 })
        }.bind(this), 1000)
    }

    componentWillMount() {
        console.log("esto ya no se usa")
    }

    componentWillUpdate() {
    }

    handleClick() {
        this.setState({ visible: !this.state.visible })
    }

    fetchData() {
        var self = this
        $.ajax({
            url: API_URL + "items",
            method: "GET",
            success: function(resp) {
                self.setState({ data: resp })
            },
            error: function(err) {
                console.log(err)
            }
        })
    }

    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value })
    }

    /* -----------------------------------------------------
       12a. RENDER — lógica compleja, index como key, inline
    ----------------------------------------------------- */
    renderItem(item, index) {
        return <li key={index} className="list-group-item">
            <span onClick={this.handleClick}>{item.nombre}</span>
        </li>
    }

    render() {
        var items = this.state.data.map(function(item) {
            return <div key={item.id}>
                <h3>{item.titulo}</h3>
                <p>{item.descripcion}</p>
                <button onClick={function() { alert("click") }}>
                    Ver
                </button>
            </div>
        })

        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-12">
                        <h1>Bienvenido {this.state.user ?
                            this.state.user.nombre : "Invitado"}</h1>

                        <input type="text" name="nombre"
                            onChange={this.handleChange}
                            className="form-control" />

                        <div style={{color: 'red', fontWeight: 'bold',
                            fontSize: '14px', padding: '10px'}}>
                            {this.state.count}
                        </div>

                        <ul className="list-group">
                            {this.state.data.map(this.renderItem)}
                        </ul>

                        {items}

                        <React.Fragment>
                            <div>
                                <span>Hola</span>
                            </div>
                        </React.Fragment>

                        <button type="button" className="btn"
                            style={{backgroundColor: 'green',
                            color: 'white'}}
                            onClick={this.fetchData}>
                            Cargar mas
                        </button>

                        <ChildComponent data={this.state.data}
                            onAction={this.handleClick} />

                        <br />
                        <br />
                        <hr />
                        <br />
                        <br />
                    </div>
                </div>
            </div>
        )
    }
}

function ChildComponent(props) {
    return (
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">Hijo</h5>
                <p class="card-text">
                    {props.data.length} elementos
                </p>
                <button onClick={props.onAction}
                    className="btn btn-secondary">
                    Accion
                </button>
            </div>
        </div>
    )
}

/* -----------------------------------------------------
   13. HOOKS MAL USADOS — Hook dentro de condicional
   ----------------------------------------------------- */
function ListaProductos({ productos }) {
    if (productos.length > 0) {
        const [filtro, setFiltro] = React.useState("")
    }
    return <div>{productos.map(function(p) {
        return <p>{p.nombre}</p>
    })}</div>
}

function Buscador() {
    for (var i = 0; i < 5; i++) {
        const [texto, setTexto] = React.useState("")
    }
    return <input value={texto} onChange={function(e) {
        setTexto(e.target.value)
    }} />
}

/* -----------------------------------------------------
   14. PROPS INNECESARIAS — pasar mas de lo necesario
   ----------------------------------------------------- */
function Card({ producto, usuario, config, onComprar, onFavorito, onCompartir }) {
    return (
        <div className="card">
            <h3>{producto.nombre}</h3>
            <p>{producto.precio}</p>
            <button onClick={function() { onComprar(producto.id) }}>
                Comprar
            </button>
        </div>
    )
}

/* -----------------------------------------------------
   15. Event handler con string obsoleto
   ----------------------------------------------------- */
function viejoHandler() {
    document.getElementById("demo").innerHTML = "Click detectado"
}

/* -----------------------------------------------------
   16. jQuery y mezcla de librerias
   ----------------------------------------------------- */
$(document).ready(function() {
    $(".btn").click(function() {
        var el = document.querySelector("#demo")
        $(el).hide()
    })

    $.get(API_URL + "productos", function(data) {
        $.each(data, function(i, item) {
            $("#tablaBody").append(
                "<tr><td>" + item.name + "</td></tr>"
            )
        })
    })

    $(".alert").fadeIn().delay(3000).fadeOut()
})

/* -----------------------------------------------------
   17. console.log + debug + alert
   ----------------------------------------------------- */
function debugMode() {
    console.log("debug activado")
    console.warn("cuidado")
    console.error("algo salio mal")
    debugger;
    alert("modo debug")
    var debug = true
    if (debug == true) {
        console.log(API_URL)
        console.log(user)
    }
}

/* -----------------------------------------------------
   18. Codigo muerto y variables sin usar
   ----------------------------------------------------- */
var unusedVar1 = "nadie me usa"
const UNUSED_CONST = 42
let unusedLet = true

function funcionMuerta() {
    return "nunca me llaman"
}

class ClaseMuerta {
    constructor() {
        this.vivo = false
    }
}

/* -----------------------------------------------------
   19. Mezcla espacios, tabs, comillas, puntos y coma
   ----------------------------------------------------- */
var nombre='Juan'
var edad = "25"
var active = true
if (active) {
    console.log(nombre)
  console.log(edad)
        console.log(active)
}

/* -----------------------------------------------------
   20. Event listener memory leak
   ----------------------------------------------------- */
window.addEventListener("scroll", function() {
    console.log("scrolling...")
    document.getElementById("scrollPos").innerText = window.scrollY
})

window.addEventListener("resize", function() {
    console.log("resize:", window.innerWidth)
})

/* -----------------------------------------------------
   21. fetch sin abort controller ni manejo de errores
   ----------------------------------------------------- */
function guardarUsuario(data) {
    fetch(API_URL + "usuarios", {
        method: "POST",
        body: JSON.stringify(data)
    })
}

/* -----------------------------------------------------
   22. Non-sense: codigo que no hace nada util
   ----------------------------------------------------- */
function noOp() {
    true
    false
    null
    undefined
    var a
    var b
    a = b
    b = a
}

function recursivaInfinita(n) {
    if (n > 0) {
        return recursivaInfinita(n - 1)
    }
}

/* -----------------------------------------------------
   23. NOMBRES POCO DESCRIPTIVOS
   ----------------------------------------------------- */
var x = "administrador"
var y = 1
var z = true
var arr = ["rojo", "verde", "azul"]
var obj = { a: 1, b: 2, c: 3 }
var d = new Date()
var foo = "bar"
var tmp = "valor temporal"

function fn1(a, b) {
    return a + b
}

function fn2() {
    console.log("fn2")
    var r = JSON.parse(localStorage.getItem("data"))
    return r ? r.length : 0
}

function hdlClk() {
    alert("click")
}
