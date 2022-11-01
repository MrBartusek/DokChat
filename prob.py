from math import log1p, sqrt

def birthday(probability_exponent, bits):
    probability = 10. ** probability_exponent
    outputs     =  2. ** bits
    return sqrt(2. * outputs * -log1p(-probability))

print(birthday(-5,160))