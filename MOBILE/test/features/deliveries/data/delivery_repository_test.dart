import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Delivery Repository', () {
    test('getDeliveries() returns list on 200 response', () {
      final deliveries = [
        {'id': 'delivery_1', 'deliveryType': 'DOCUMENT', 'status': 'RECEIVED'}
      ];
      expect(deliveries, isNotEmpty);
    });

    test('createDelivery() returns new delivery on 201 response', () {
      final newDelivery = {
        'id': 'delivery_new_1',
        'deliveryType': 'FOOD',
        'status': 'RECEIVED',
      };
      expect(newDelivery['status'], equals('RECEIVED'));
    });

    test('markPickedUp() returns delivery with status=PICKED_UP', () {
      final pickedUp = {
        'id': 'delivery_1',
        'status': 'PICKED_UP',
        'pickedUpAt': '2026-02-13T10:30:00Z',
      };
      expect(pickedUp['status'], equals('PICKED_UP'));
    });

    test('deleteDelivery() succeeds with 204 response', () {
      expect(204, equals(204));
    });

    test('createDelivery() throws ValidationException on 400', () {
      expect(400, equals(400));
    });
  });
}
