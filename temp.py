import csv

# edit these lists using codes from:
# http://www.geonames.org/export/codes.html

lcodes = ['AMUS','CST','RGNH']
scodes = ['PPLH','AMTH','ARCHV','ART','MNMT','OPRA','PYR','PYRS']

# debug
counts = {i: 0 for i in lcodes + scodes} 

with open('allCountries.tsv', 'r', errors='ignore') as tsv, open('landmarks.txt', 'w') as landmarks:
    tsv = csv.reader(tsv, delimiter='\t')
    for row in tsv:
        code = row[7]
        if code in lcodes or code in scodes:
            landmarks.write(row[2] + '\n')

# debug
# with open('allCountries.tsv', 'r', errors='ignore') as tsv, open('landmarks.txt', 'w') as landmarks:
#     tsv = csv.reader(tsv, delimiter='\t')
#     count = 0
#     for row in tsv:
#         code = row[7]
#         if code in lcodes or code in scodes:
#             landmarks.write(row[2] + '\n')
#             count += 1
#             counts[code] += 1
#         if count == 10000:
#             break
#         # filter for code

# print({x:y for x,y in counts.items() if y!=0})