# Algoritme per calcular la factura d'aigua segons el consum en litres
# Calcula la factura del aigua donats els litres consumits segons les següents tarifes:
# Quota fitxe mensual de 6 euros
# Si el consum es menor de 50 litros, no paga quota
# Si el consum està entre 50 i 200 litres, paga 0.1 euros per litre
# Si el consum és superior a 200 litres, paga 0.3 euros per litre
# Amb control d'errors si l'usuari escriu text en comptes de número
def calcular_factura_aigua(litres):
    quota_fixa = 6.0
    if litres < 50:
        cost = 0.0
    elif 50 <= litres <= 200:
        cost = litres * 0.1
    else:
        cost = litres * 0.3
    total = cost + (quota_fixa if litres >= 50 else 0)
    return total
def main():
    try:
        litres = float(input("Introdueix el consum d'aigua en litres: "))
        if litres < 0:
            print("El consum no pot ser negatiu.")
            return
    except ValueError:
        print("Si us plau, introdueix un número vàlid.")
        return
    factura = calcular_factura_aigua(litres)
    print(f"La factura total d'aigua és: {factura:.2f} euros")
if __name__ == "__main__":
    main()
# Fi de l'algoritme
