import express from 'express';
import cors from 'cors';
import { Client } from '@temporalio/client';
import { deliveryMonitoringWorkflow } from './workflows/deliveryMonitoringWorkflow';
import { DeliveryRoute } from './types';
import { z } from 'zod';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Validation schema for delivery route
const DeliveryRouteSchema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().min(1, 'Customer phone is required'),
});

// Temporal client
const client = new Client();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start delivery monitoring workflow endpoint
app.post('/api/delivery/start-monitoring', async (req, res) => {
  try {
    // Validate request body
    const validationResult = DeliveryRouteSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const deliveryRoute: DeliveryRoute = validationResult.data;
    const delayThreshold = parseInt(process.env.DELAY_THRESHOLD_MINUTES || '30', 10);

    // Start the workflow
    const handle = await client.workflow.start(deliveryMonitoringWorkflow, {
      taskQueue: 'delivery-monitoring',
      workflowId: `delivery-${Date.now()}`,
      args: [deliveryRoute, delayThreshold],
    });

    console.log(`Started workflow ${handle.workflowId} for delivery route:`, deliveryRoute);

    res.json({
      success: true,
      workflowId: handle.workflowId,
      deliveryRoute,
      delayThreshold,
      message: 'Delivery monitoring workflow started successfully'
    });

  } catch (error) {
    console.error('Error starting delivery monitoring workflow:', error);
    res.status(500).json({
      error: 'Failed to start delivery monitoring workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get workflow status endpoint
app.get('/api/delivery/status/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    
    const handle = client.workflow.getHandle(workflowId);
    const result = await handle.result();

    res.json({
      success: true,
      workflowId,
      result,
      message: 'Workflow completed'
    });

  } catch (error) {
    console.error(`Error getting workflow status for ${req.params.workflowId}:`, error);
    res.status(500).json({
      error: 'Failed to get workflow status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Freight Delivery Monitor API server running on port ${port}`);
  console.log(`📍 Health check: http://localhost:${port}/health`);
  console.log(`📦 Start monitoring: POST http://localhost:${port}/api/delivery/start-monitoring`);
  console.log(`📊 Check status: GET http://localhost:${port}/api/delivery/status/:workflowId`);
});

export default app; 