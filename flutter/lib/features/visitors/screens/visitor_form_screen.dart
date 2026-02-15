import 'package:flutter/material.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:form_builder_validators/form_builder_validators.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/visit.dart';
import '../../../core/providers/lookups_provider.dart';
import '../../../core/utils/date_format.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../hosts/providers/hosts_provider.dart';
import '../providers/visitors_provider.dart';

class VisitorFormScreen extends ConsumerStatefulWidget {
  final Visit? initialData;
  final bool isEditing;

  const VisitorFormScreen({
    super.key,
    this.initialData,
    this.isEditing = false,
  });

  @override
  ConsumerState<VisitorFormScreen> createState() => _VisitorFormScreenState();
}

class _VisitorFormScreenState extends ConsumerState<VisitorFormScreen> {
  late final GlobalKey<FormBuilderState> _formKey;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _formKey = GlobalKey<FormBuilderState>();
  }

  Future<void> _handleSubmit() async {
    if (_formKey.currentState?.saveAndValidate() ?? false) {
      setState(() => _isSubmitting = true);

      try {
        final data = _formKey.currentState!.value;

        if (widget.isEditing && widget.initialData != null) {
          await ref
              .read(visitorsListProvider.notifier)
              .updateVisitor(widget.initialData!.id, data);
        } else {
          await ref.read(visitorsListProvider.notifier).createVisitor(data);
        }

        if (mounted) {
          context.pop();
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $e')),
          );
        }
      } finally {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final purposes = ref.watch(purposesProvider);
    final hosts = ref.watch(hostsListProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.isEditing ? 'Edit Visitor' : 'Add Visitor'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: FormBuilder(
          key: _formKey,
          initialValue: widget.initialData != null
              ? {
                  'visitorName': widget.initialData!.visitorName,
                  'visitorCompany': widget.initialData!.visitorCompany,
                  'visitorPhone': widget.initialData!.visitorPhone,
                  'visitorEmail': widget.initialData!.visitorEmail,
                  'hostId': widget.initialData!.hostId,
                  'purpose': widget.initialData!.purpose,
                  'visitDate': widget.initialData!.expectedDate,
                }
              : {},
          child: Column(
            children: [
              FormBuilderTextField(
                name: 'visitorName',
                decoration: const InputDecoration(
                  labelText: 'Visitor Name',
                  border: OutlineInputBorder(),
                ),
                validator: FormBuilderValidators.required(context),
              ),
              const SizedBox(height: 16),
              FormBuilderTextField(
                name: 'visitorCompany',
                decoration: const InputDecoration(
                  labelText: 'Visitor Company',
                  border: OutlineInputBorder(),
                ),
                validator: FormBuilderValidators.required(context),
              ),
              const SizedBox(height: 16),
              FormBuilderTextField(
                name: 'visitorPhone',
                decoration: const InputDecoration(
                  labelText: 'Phone',
                  border: OutlineInputBorder(),
                ),
                validator: FormBuilderValidators.required(context),
              ),
              const SizedBox(height: 16),
              FormBuilderTextField(
                name: 'visitorEmail',
                decoration: const InputDecoration(
                  labelText: 'Email',
                  border: OutlineInputBorder(),
                ),
                validator: FormBuilderValidators.compose([
                  FormBuilderValidators.required(context),
                  FormBuilderValidators.email(context),
                ]),
              ),
              const SizedBox(height: 16),
              hosts.when(
                data: (data) => FormBuilderDropdown<String>(
                  name: 'hostId',
                  decoration: const InputDecoration(
                    labelText: 'Host/Company',
                    border: OutlineInputBorder(),
                  ),
                  items: data.data
                      .map((host) => DropdownMenuItem(
                            value: host.id,
                            child: Text('${host.name} (${host.company})'),
                          ))
                      .toList(),
                  validator: FormBuilderValidators.required(context),
                ),
                loading: () => const Padding(
                  padding: EdgeInsets.all(16),
                  child: CircularProgressIndicator(),
                ),
                error: (error, _) => Text('Error loading hosts: $error'),
              ),
              const SizedBox(height: 16),
              purposes.when(
                data: (data) => FormBuilderDropdown<String>(
                  name: 'purpose',
                  decoration: const InputDecoration(
                    labelText: 'Purpose of Visit',
                    border: OutlineInputBorder(),
                  ),
                  items: data
                      .map((p) => DropdownMenuItem(
                            value: p.id,
                            child: Text(p.name),
                          ))
                      .toList(),
                  validator: FormBuilderValidators.required(context),
                ),
                loading: () => const Padding(
                  padding: EdgeInsets.all(16),
                  child: CircularProgressIndicator(),
                ),
                error: (error, _) => Text('Error loading purposes: $error'),
              ),
              const SizedBox(height: 16),
              FormBuilderDateTimePicker(
                name: 'visitDate',
                decoration: const InputDecoration(
                  labelText: 'Visit Date & Time',
                  border: OutlineInputBorder(),
                ),
                inputType: InputType.both,
                validator: FormBuilderValidators.required(context),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _handleSubmit,
                  child: _isSubmitting
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : Text(widget.isEditing ? 'Update' : 'Create'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
