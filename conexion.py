import psycopg2

# Conexión a la base de datos
def Conexion():
    return psycopg2.connect(
        user='postgres',
        password='123',
        host='localhost',
        port='5432',
        database='sig_sistema'
);
