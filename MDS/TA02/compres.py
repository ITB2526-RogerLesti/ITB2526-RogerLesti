try:
    preuOriginal = float(input("Introdueix el preu original del producte: "))
    descomptePercentatge = float(input("Introdueix el percentatge de descompte: "))
except ValueError:
    print("idiota pon un número valido no me seas gil.")
else:
    preufinal = preuOriginal * (1 - descomptePercentatge / 100)
    print("El preu final del article és:",preufinal)
finally:
    print("Gràcies por usar esta aplicació.")











