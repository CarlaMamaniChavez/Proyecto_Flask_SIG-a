CREATE DATABASE SIG_SISTEMA;

CREATE TABLE rutas (
  id serial,
  id_usuario integer,
  latitudInicio double precision NOT NULL,
  longitudInicio double precision NOT NULL,
  latitudDestino double precision NOT NULL,
  longitudDestino double precision NOT NULL,
  creado_at timestamptz DEFAULT now()
);


CREATE TABLE USUARIOS(
  id serial,
  nombres varchar(50),
  apellidos varchar(50),
  clave varchar(50),
  usuario varchar(50)
);