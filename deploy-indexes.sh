#!/bin/bash

# Firestore Index'lerini Deploy Et
echo "🚀 Firestore index'leri deploy ediliyor..."

# Firebase CLI ile index'leri deploy et
firebase deploy --only firestore:indexes

echo "✅ Index'ler başarıyla deploy edildi!"
echo ""
echo "📊 Deploy edilen index'ler:"
echo "- Tedarikçi alışları için tarih filtreleme"
echo "- Müşteri satışları için tarih filtreleme" 
echo "- İşlemler için tarih filtreleme"
echo "- Tarih + tutar sıralama kombinasyonları"
echo ""
echo "🔍 Index durumunu kontrol etmek için:"
echo "firebase firestore:indexes"
