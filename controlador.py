from conexion import Conexion
from psycopg2.extras import RealDictCursor

def Buscar_Dato(id:int):
    try:
        conn = Conexion()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        sql = f'SELECT * FROM USUARIOS WHERE ID = {id}'
        cursor.execute(sql)
        texto = cursor.fetchone()
        cursor.close()
        conn.close()
        return dict(texto) if texto else None
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def Eliminar_Dato(id:int):
    conn = Conexion()
    cursor = conn.cursor()
    sql = f'DELETE FROM USUARIOS WHERE ID = {id}'
    cursor.execute(sql)
    texto = "ELEMENTO ELIMINADO"
    conn.commit()
    cursor.close()
    conn.close()
    return texto

def Actualizar_Dato(id:int, nombres, apellidos, clave, usuario):
    conn=Conexion()
    cursor=conn.cursor()
    sql=f"UPDATE usuarios SET nombres='{nombres}', apellidos='{apellidos}', clave='{clave}', usuario='{usuario}' WHERE id={id}"
    cursor.execute(sql)
    texto="ELEMENTO ACTUALIZADO"
    conn.commit()
    cursor.close()
    conn.close()
    return texto

def Crear_Dato(nombres,apellidos,clave,usuario):
    conn=Conexion()
    cursor=conn.cursor()
    sql=f"INSERT INTO usuarios (nombres, apellidos, clave, usuario) VALUES ('{nombres}', '{apellidos}', '{clave}', '{usuario}');"
    cursor.execute(sql)
    texto="ELEMENTO CREADO"
    conn.commit()
    cursor.close()
    conn.close()
    return texto

def Validar_Datos(usuario,clave):
    try: 
        conn=Conexion()
        cursor=conn.cursor(cursor_factory=RealDictCursor)
        sql=f"SELECT * FROM USUARIOS WHERE usuario = '{usuario}' and clave='{clave}';"
        cursor.execute(sql)
        texto = cursor.fetchone()
        cursor.close()
        conn.close()
        return dict(texto) if texto else None
    finally:
        if cursor: cursor.close()
        if conn: conn.close()




def Crear_Ruta(id,latitudInicio,longitudInicio,latitudDestino,longitudDestino):
    conn=Conexion()
    cursor=conn.cursor()
    sql=f"INSERT INTO rutas (id_usuario,latitudInicio,longitudInicio,latitudDestino,longitudDestino) VALUES ({id},{latitudInicio}, {longitudInicio},{latitudDestino},{longitudDestino});"
    cursor.execute(sql)
    texto="ELEMENTO CREADO"
    conn.commit()
    cursor.close()
    conn.close()
    return texto

def Buscar_Mis_Rutas(id_usuario):
    conn = None
    cursor = None
    try:
        conn = Conexion()
        cursor = conn.cursor()
        sql = 'SELECT LATITUDINICIO, LONGITUDINICIO, LATITUDDESTINO, LONGITUDDESTINO FROM RUTAS WHERE ID_USUARIO = %s'
        cursor.execute(sql, (id_usuario,))
        cols = [c[0].lower() for c in cursor.description]  # nombres en minúscula opcional
        filas = cursor.fetchall()
        return [dict(zip(cols, fila)) for fila in filas] if filas else []
    except Exception:
        raise
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            try:
                conn.close()
            except Exception:
                pass
