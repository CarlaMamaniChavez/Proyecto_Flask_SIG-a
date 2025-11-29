import os

from flask import Flask, render_template,redirect,url_for,flash
import controlador
import psycopg2

app = Flask(__name__)

app.secret_key = os.environ.get('SECRET_KEY', os.urandom(24))

@app.route('/mapa/<int:id>')
def mapa(id):
    return render_template('mapa.html',user_id=id)

@app.route('/mapa')
def mapaSinDatos():
    return render_template('mapa.html')


@app.route('/clima')
def clima():
    return render_template('mapaClima2.html')

@app.route('/')
def login():
    return render_template('login.html')


@app.route('/login/validate/<usuario>/<clave>')
def validate(usuario, clave):
    # controlador.Buscar_Dato debe devolver fila (dict/objeto) o None
    fila = controlador.Validar_Datos(usuario, clave)
    if fila:
        # credenciales válidas: redirigir a /mapa/
        user_id = fila.get('id')
        if user_id is None:
            return redirect(url_for('mapa'))  # 'mapa_index' = nombre de la vista que maneja /mapa/
        return redirect(url_for('mapa',id=user_id))
        
    else:
        flash('Credenciales inválidas. Intenta nuevamente.', 'danger')
        return redirect(url_for('login'))


@app.route('/mapa/read/<int:id>')
def read(id):
    fila = controlador.Buscar_Dato(id)
    return render_template('vista.html', fila=fila)

@app.route('/mapa/delete/<int:id>')
def delete(id):
    fila = controlador.Eliminar_Dato(id)
    return render_template('vista.html',fila=fila)

@app.route('/mapa/update/<int:id>/<nombres>/<apellidos>/<clave>/<usuario>/')
def update(id,nombres,apellidos,clave,usuario):
    fila = controlador.Actualizar_Dato(id,nombres,apellidos,clave,usuario)
    return render_template('vista.html',fila=fila)

@app.route('/mapa/create/<nombres>/<apellidos>/<clave>/<usuario>/')
def create(nombres,apellidos,clave,usuario):
    fila = controlador.Crear_Dato(nombres,apellidos,clave,usuario)
    return render_template('vista.html',fila=fila)

@app.route('/mapa/ruta/create/<int:id>/<latitudInicio>/<longitudInicio>/<latitudDestino>/<longitudDestino>')
def createRuta(id,latitudInicio,longitudInicio,latitudDestino,longitudDestino):
    fila=controlador.Crear_Ruta(id,latitudInicio,longitudInicio,latitudDestino,longitudDestino)
    return redirect(url_for('mapa',id=id))

@app.route('/mapa/ruta/mis_rutas/<int:id>')
def consultaMisRutas(id):
    fila = controlador.Buscar_Mis_Rutas(id)
    return render_template('mis_rutas.html',fila=fila)

@app.route('/mapa/ruta/mis_rutas')
def MisRutas():
    return render_template('mis_rutas.html')

if __name__ == '__main__':
    app.run(debug=True)

    