###
# Author: Guoxin Wang
# Date: 2025-11-04 20:05:30
# LastEditors: Guoxin Wang
# LastEditTime: 2025-11-11 11:33:52
# FilePath: /AnnoDesignerWEB/scripts/add.sh
# Description: 
# 
# Copyright (c) 2025 by Guoxin Wang, All Rights Reserved. 
###

for i in 0 {10..33}; do
    python add_loc_auto.py -i presets_new.json -s ./rda/data$i/data/config/gui/texts_english.xml -t ./rda/data$i/data/config/gui/texts_chinese.xml
done

python add_loc_manually.py -i presets_new.json