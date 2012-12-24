Utilidades Desatendidas
=======================

Crear Flash booteable con WinXp desatendido
-------------------------------------------
1. Selecionar una Flash como minimo de 1G si se desea instalar las aplicaciones(Kav,Office,jdk...etc) debe ser de 2G
 y Hacer el backup de la información que esta contenga.
2. Luego pasarle la imaget del ghost *WinUnnatendedUSB.GHO*.Es una imagen de disco no de particion por lo que se seleciona Disk>From imagen>
se seleciona la imagen y luego se le asigna a la flash(Hay que tener precaucion con este paso para no equivocarse de disco).
3. La flash ya en este paso instala winXp de manera desatendida.
Para que funcionen la instalacion de aplicaciones desatendidas (Kav,Office,jdk...etc) y ademas el disco cuente con un hirenBootCD se debe copiar 
afuera en la raiz de la unidad flash las carpetas HBCD y SOFT conservando esos mismos nombres.

Instalar usando la flash booteable
----------------------------------
1. Una vez creada la flash se le configura por antes de usar en una maquina el el nombre de esta, el dominio, el password de root...
 Para esto se ejecuta UnatendUtil.exe en la raiz de la unidad.
  ComputerName=nombre de la PC
  Domain=Por defecto Gercam
  Tech User y Tech User Pass = Usuario del dominio y password con privilegio de unir la PC a este (tecnico de soporte o administrador del dominio)
2. Se arranca desde la usb y se seleciona *Paso 1 del Setup de WinXp* se seleciona la particion como es de costumbre.
3. Luego se seleciona *Paso 2 y  3 Setup de WinXP* dos veces si la flash es el primer dispositivo de arranque selecionara este paso automaticamente.
