import 'package:flutter/material.dart';

/// Paginated list view widget
/// Displays a list with pagination controls
class PaginatedListView extends StatelessWidget {
  const PaginatedListView({
    super.key,
    required this.items,
    required this.isLoading,
    required this.onLoadMore,
    this.hasMore = false,
  });

  final List<dynamic> items;
  final bool isLoading;
  final VoidCallback onLoadMore;
  final bool hasMore;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: items.length + (hasMore ? 1 : 0),
      itemBuilder: (context, index) {
        if (index < items.length) {
          return items[index];
        } else if (isLoading) {
          return const Padding(
            padding: EdgeInsets.all(16),
            child: Center(child: CircularProgressIndicator()),
          );
        } else {
          return const Padding(
            padding: EdgeInsets.all(16),
            child: Center(child: Text('Load more')),
          );
        }
      },
    );
  }
}
