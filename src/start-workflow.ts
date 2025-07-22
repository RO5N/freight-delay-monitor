import { Client } from '@temporalio/client';
import { deliveryMonitoringWorkflow } from './workflows/deliveryMonitoringWorkflow';
import { DeliveryRoute } from './types';
import 'dotenv/config'

async function run() {
  const client = new Client();
  
  // Sample delivery route for testing
  const sampleRoute: DeliveryRoute = {
    origin: 'New Brunswick, New Jersey, USA',
    destination: 'Newark, New Jersey, USA',
    customerId: 'CUST-001',
    customerName: 'John Snow',
    customerEmail: 'johnsnow@example.com',
    customerPhone: '+1-555-123-4567',
  };
  
  const delayThreshold = parseInt(process.env.DELAY_THRESHOLD_MINUTES || '30', 10);
  
  const handle = await client.workflow.start(deliveryMonitoringWorkflow, {
    taskQueue: 'delivery-monitoring',
    workflowId: `delivery-${Date.now()}`,
    args: [sampleRoute, delayThreshold],
  });

  console.log(`Started workflow ${handle.workflowId}`);
  console.log('Sample route:', sampleRoute);
  
  const result = await handle.result();
  console.log('Workflow result:', result);
}

run().catch(console.error);