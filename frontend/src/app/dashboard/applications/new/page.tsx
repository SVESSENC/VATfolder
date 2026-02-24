'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

const applicationSchema = z.object({
  cvrNumber: z.string().regex(/^\d{8}\$/, 'CVR number must be 8 digits'),
  businessName: z.string().min(1, 'Business name is required'),
  registrationDate: z.string(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export default function NewApplicationPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  const onSubmit = async (data: ApplicationFormData) => {
    setSubmitting(true);
    try {
      // TODO: Submit to API
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating application:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">New VAT Application</h1>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-8 rounded-lg shadow">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="cvrNumber">CVR Number</Label>
              <Input
                id="cvrNumber"
                placeholder="12345678"
                {...register('cvrNumber')}
                className="mt-1"
              />
              {errors.cvrNumber && (
                <p className="text-red-600 text-sm mt-1">{errors.cvrNumber.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                placeholder="Your Business Name"
                {...register('businessName')}
                className="mt-1"
              />
              {errors.businessName && (
                <p className="text-red-600 text-sm mt-1">{errors.businessName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="registrationDate">Registration Date</Label>
              <Input
                id="registrationDate"
                type="date"
                {...register('registrationDate')}
                className="mt-1"
              />
              {errors.registrationDate && (
                <p className="text-red-600 text-sm mt-1">{errors.registrationDate.message}</p>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {submitting ? 'Creating...' : 'Create Application'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
