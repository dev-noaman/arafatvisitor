// Unit tests for Delivery model
//
// Tests cover:
// - deliveryType field (string: Document, Food, Gift)
// - DeliveryStatus enum (PENDING, RECEIVED, PICKED_UP)
// - pickedUpAt timestamp validation
// - Host relationship

import 'package:flutter_test/flutter_test.dart';
import 'package:arafatvisitor/core/models/delivery.dart';
import '../../fixtures/factories.dart';
import '../../fixtures/models.dart';

void main() {
  group('Delivery Model', () {
    final documentDeliveryJson = {
      'id': 'delivery_1',
      'deliveryType': 'Document',
      'recipient': 'Finance Department',
      'hostId': 'host_1',
      'courier': 'DHL',
      'location': 'MAIN_LOBBY',
      'status': 'RECEIVED',
      'notes': 'Important documents',
      'receivedAt': '2026-02-13T09:00:00Z',
      'pickedUpAt': null,
      'createdAt': '2026-02-13T09:00:00Z',
    };

    test('Document delivery deserializes from JSON correctly', () {
      // ARRANGE
      final json = documentDeliveryJson;

      // ACT
      final delivery = Delivery.fromJson(json);

      // ASSERT
      expect(delivery.id, equals('delivery_1'));
      expect(delivery.deliveryType, equals('Document'));
      expect(delivery.status, equals(DeliveryStatus.received));
    });

    test('Delivery fields are populated correctly', () {
      // ARRANGE
      final json = documentDeliveryJson;

      // ACT
      final delivery = Delivery.fromJson(json);

      // ASSERT
      expect(delivery.recipient, equals('Finance Department'));
      expect(delivery.courier, equals('DHL'));
      expect(delivery.notes, equals('Important documents'));
    });

    test('DeliveryStatus enum values are valid', () {
      // ASSERT
      final statuses = [
        DeliveryStatus.pending,
        DeliveryStatus.received,
        DeliveryStatus.pickedUp,
      ];

      expect(statuses.length, equals(3));
      expect(statuses.contains(DeliveryStatus.received), isTrue);
    });

    test('Nullable pickedUpAt field handled correctly', () {
      // ARRANGE
      final json = documentDeliveryJson;

      // ACT
      final delivery = Delivery.fromJson(json);

      // ASSERT
      expect(delivery.pickedUpAt, isNull);
    });

    test('PickedUpAt must be after receivedAt when present', () {
      // ARRANGE
      final pickedUpDelivery = createMockPickedUpDelivery();

      // ASSERT
      expect(pickedUpDelivery.pickedUpAt, isNotNull);
      expect(pickedUpDelivery.receivedAt, isNotNull);
      expect(pickedUpDelivery.pickedUpAt!.isAfter(pickedUpDelivery.receivedAt!), isTrue);
    });

    test('RECEIVED status must have null pickedUpAt', () {
      // ARRANGE
      final receivedDelivery = createMockDocumentDelivery();

      // ASSERT
      expect(receivedDelivery.status, equals(DeliveryStatus.received));
      expect(receivedDelivery.pickedUpAt, isNull);
    });

    test('PICKED_UP status must have non-null pickedUpAt', () {
      // ARRANGE
      final pickedUpDelivery = createMockPickedUpDelivery();

      // ASSERT
      expect(pickedUpDelivery.status, equals(DeliveryStatus.pickedUp));
      expect(pickedUpDelivery.pickedUpAt, isNotNull);
    });

    test('Courier must be non-empty string', () {
      // ARRANGE
      final delivery = createMockDocumentDelivery(courier: 'FedEx');

      // ACT
      final json = delivery.toJson();

      // ASSERT
      expect((json['courier'] as String).isNotEmpty, isTrue);
      expect(json['courier'], equals('FedEx'));
    });

    test('Recipient must be non-empty string', () {
      // ARRANGE
      final delivery = createMockDocumentDelivery(recipient: 'HR Department');

      // ACT
      final json = delivery.toJson();

      // ASSERT
      expect((json['recipient'] as String).isNotEmpty, isTrue);
      expect(json['recipient'], equals('HR Department'));
    });

    test('Round-trip serialization preserves data', () {
      // ARRANGE
      final originalJson = documentDeliveryJson;

      // ACT
      final delivery = Delivery.fromJson(originalJson);
      final roundTripJson = delivery.toJson();

      // ASSERT
      expect(roundTripJson['id'], equals(originalJson['id']));
      expect(roundTripJson['deliveryType'], equals(originalJson['deliveryType']));
      expect(roundTripJson['recipient'], equals(originalJson['recipient']));
    });

    test('DeliveryType field accepts various values', () {
      // ARRANGE
      final documentDelivery = createMockDocumentDelivery();
      final foodDelivery = createMockFoodDelivery();

      // ASSERT
      expect(documentDelivery.deliveryType, equals('Document'));
      expect(foodDelivery.deliveryType, equals('Food'));
    });

    test('Host relationship is optional', () {
      // ARRANGE
      final deliveryWithoutHost = Delivery(
        id: 'delivery_1',
        deliveryType: 'Document',
        recipient: 'Recipient',
        hostId: 'host_1',
        courier: 'DHL',
        location: 'MAIN_LOBBY',
        status: DeliveryStatus.received,
        createdAt: DateTime.now(),
      );

      // ASSERT
      expect(deliveryWithoutHost.host, isNull);
      expect(deliveryWithoutHost.hostId, equals('host_1'));
    });

    test('Host relationship is preserved when provided', () {
      // ARRANGE
      final delivery = createMockDocumentDelivery(host: mockExternalHost);

      // ASSERT
      expect(delivery.host, isNotNull);
      expect(delivery.host!.id, equals(mockExternalHost.id));
    });
  });

  group('Delivery Model - Factory Functions', () {
    test('createMockDocumentDelivery returns Document type', () {
      // ACT
      final delivery = createMockDocumentDelivery();

      // ASSERT
      expect(delivery.deliveryType, equals('Document'));
      expect(delivery.status, equals(DeliveryStatus.received));
    });

    test('createMockFoodDelivery returns Food type', () {
      // ACT
      final delivery = createMockFoodDelivery();

      // ASSERT
      expect(delivery.deliveryType, equals('Food'));
      expect(delivery.courier, equals('Snoonu'));
    });

    test('createMockPickedUpDelivery returns PICKED_UP status', () {
      // ACT
      final delivery = createMockPickedUpDelivery();

      // ASSERT
      expect(delivery.status, equals(DeliveryStatus.pickedUp));
      expect(delivery.pickedUpAt, isNotNull);
    });

    test('Factory functions allow customization', () {
      // ACT
      final customDelivery = createMockDocumentDelivery(
        recipient: 'Custom Recipient',
        courier: 'Aramex',
      );

      // ASSERT
      expect(customDelivery.recipient, equals('Custom Recipient'));
      expect(customDelivery.courier, equals('Aramex'));
    });
  });
}
